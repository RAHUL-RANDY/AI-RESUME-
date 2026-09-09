import os
import uuid
import logging
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv
import supabase
from backend.database.mongo import InMemoryDatabase, InMemoryCollection

load_dotenv()

logger = logging.getLogger("career_intelligence.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY", "")


class SupabaseTableCollection:
    """
    Async-compatible collection adapter over a Supabase PostgreSQL table.
    Translates MongoDB/dict query idioms into Supabase PostgREST queries.
    Features graceful fallback for unmigrated tables and schema column differences.
    """
    fallback_collections: Dict[str, InMemoryCollection] = {}
    missing_tables: set = set()
    user_overrides: Dict[str, Dict[str, Any]] = {}

    def __init__(self, client: supabase.Client, table_name: str):
        self.client = client
        self.table_name = table_name

    def _get_fallback(self) -> InMemoryCollection:
        if self.table_name not in SupabaseTableCollection.fallback_collections:
            SupabaseTableCollection.fallback_collections[self.table_name] = InMemoryCollection(self.table_name)
        return SupabaseTableCollection.fallback_collections[self.table_name]

    def _clean_doc_for_postgres(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Maps '_id' to 'id' for PostgreSQL compatibility."""
        clean = doc.copy()
        if "_id" in clean:
            clean["id"] = str(clean.pop("_id"))
        return clean

    def _clean_doc_from_postgres(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Maps 'id' back to '_id' for backend schemas expecting _id."""
        clean = doc.copy()
        if "id" in clean and "_id" not in clean:
            clean["_id"] = str(clean["id"])
        return clean

    async def find_one(self, query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        if self.table_name in SupabaseTableCollection.missing_tables:
            return await self._get_fallback().find_one(query, projection)

        try:
            req = self.client.table(self.table_name).select("*")
            for k, v in query.items():
                col = "id" if k == "_id" else k
                req = req.eq(col, v)
            
            res = req.limit(1).execute()
            if res.data and len(res.data) > 0:
                doc = self._clean_doc_from_postgres(res.data[0])
                uid = str(doc.get("_id") or doc.get("id", ""))
                email = str(doc.get("email", ""))
                if uid in SupabaseTableCollection.user_overrides:
                    doc.update(SupabaseTableCollection.user_overrides[uid])
                elif email in SupabaseTableCollection.user_overrides:
                    doc.update(SupabaseTableCollection.user_overrides[email])
                if projection and projection.get("_id") == 0:
                    doc.pop("_id", None)
                return doc
            
            # If not found in PostgreSQL users table, check if created in fallback
            if self.table_name == "users":
                fb_doc = await self._get_fallback().find_one(query, projection)
                if fb_doc:
                    return fb_doc

            return None
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str or "Could not find the table" in err_str:
                SupabaseTableCollection.missing_tables.add(self.table_name)
                return await self._get_fallback().find_one(query, projection)
            logger.error(f"Supabase find_one error on table {self.table_name}: {e}")
            return None

    async def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        if self.table_name in SupabaseTableCollection.missing_tables:
            return await self._get_fallback().find(query, projection)

        client = self.client
        table_name = self.table_name
        clean_fn = self._clean_doc_from_postgres
        self_col = self

        class SupabaseAsyncCursor:
            def __init__(self):
                self._query = query or {}
                self._limit: Optional[int] = None
                self._skip: int = 0
                self._order_col: Optional[str] = None
                self._ascending: bool = True
                self._cached_docs: Optional[List[Dict[str, Any]]] = None

            def sort(self, key: str, direction: int = 1):
                col = "id" if key == "_id" else key
                self._order_col = col
                self._ascending = direction > 0
                return self

            def limit(self, n: int):
                self._limit = n
                return self

            def skip(self, n: int):
                self._skip = n
                return self

            async def _fetch(self) -> List[Dict[str, Any]]:
                if self._cached_docs is not None:
                    return self._cached_docs
                
                try:
                    req = client.table(table_name).select("*")
                    for k, v in self._query.items():
                        col = "id" if k == "_id" else k
                        req = req.eq(col, v)
                    
                    if self._order_col:
                        req = req.order(self._order_col, desc=not self._ascending)
                    if self._skip > 0:
                        end = self._skip + (self._limit or 100) - 1
                        req = req.range(self._skip, end)
                    elif self._limit:
                        req = req.limit(self._limit)
                    
                    res = req.execute()
                    docs = [clean_fn(row) for row in (res.data or [])]
                    for doc in docs:
                        uid = doc.get("_id") or doc.get("id")
                        if uid and str(uid) in SupabaseTableCollection.user_overrides:
                            doc.update(SupabaseTableCollection.user_overrides[str(uid)])
                    self._cached_docs = docs
                    return docs
                except Exception as err:
                    err_str = str(err)
                    if "PGRST205" in err_str or "Could not find the table" in err_str:
                        SupabaseTableCollection.missing_tables.add(table_name)
                        cursor = await self_col._get_fallback().find(self._query)
                        return await cursor.to_list()
                    logger.error(f"Supabase cursor fetch error on {table_name}: {err}")
                    return []

            async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
                docs = await self._fetch()
                if length is not None:
                    return docs[:length]
                return docs

            def __aiter__(self):
                return self

            async def __anext__(self):
                docs = await self._fetch()
                if not hasattr(self, "_iter"):
                    self._iter = iter(docs)
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        return SupabaseAsyncCursor()

    async def insert_one(self, doc: Dict[str, Any]):
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        if self.table_name in SupabaseTableCollection.missing_tables:
            return await self._get_fallback().insert_one(doc)

        clean_doc = self._clean_doc_for_postgres(doc)
        if self.table_name == "users" and "subscription_tier" in clean_doc:
            uid = str(clean_doc.get("id", ""))
            if uid:
                SupabaseTableCollection.user_overrides.setdefault(uid, {})["subscription_tier"] = clean_doc["subscription_tier"]

        try:
            res = self.client.table(self.table_name).insert(clean_doc).execute()
            inserted_id = res.data[0].get("id") if res.data else clean_doc.get("id")
            return InsertResult(inserted_id)
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str or "Could not find the table" in err_str:
                SupabaseTableCollection.missing_tables.add(self.table_name)
                return await self._get_fallback().insert_one(doc)
            if ("42703" in err_str or "PGRST204" in err_str or "schema cache" in err_str) and self.table_name == "users":
                clean_doc.pop("subscription_tier", None)
                try:
                    res = self.client.table(self.table_name).insert(clean_doc).execute()
                    inserted_id = res.data[0].get("id") if res.data else clean_doc.get("id")
                    return InsertResult(inserted_id)
                except Exception as inner_e:
                    logger.error(f"Supabase fallback insert error: {inner_e}")
            logger.error(f"Supabase insert_one error on table {self.table_name}: {e}")
            return InsertResult(clean_doc.get("id") or str(uuid.uuid4()))

    async def update_one(self, filter_query: Dict[str, Any], update_doc: Dict[str, Any], upsert: bool = False):
        class UpdateResult:
            def __init__(self, matched_count, modified_count, upserted_id=None):
                self.matched_count = matched_count
                self.modified_count = modified_count
                self.upserted_id = upserted_id

        if self.table_name in SupabaseTableCollection.missing_tables:
            return await self._get_fallback().update_one(filter_query, update_doc, upsert)

        data = update_doc.get("$set", update_doc)
        clean_data = self._clean_doc_for_postgres(data)

        if self.table_name == "users":
            uid = filter_query.get("_id") or filter_query.get("id") or filter_query.get("email")
            if uid:
                uid_str = str(uid)
                for key in ("subscription_tier", "role", "name"):
                    if key in clean_data:
                        SupabaseTableCollection.user_overrides.setdefault(uid_str, {})[key] = clean_data[key]
            # Also sync into fallback collection
            await self._get_fallback().update_one(filter_query, update_doc, upsert)

        try:
            req = self.client.table(self.table_name).update(clean_data)
            for k, v in filter_query.items():
                col = "id" if k == "_id" else k
                req = req.eq(col, v)
            res = req.execute()
            count = len(res.data) if res.data else 0
            return UpdateResult(count, count)
        except Exception as e:
            err_str = str(e)
            if "PGRST205" in err_str or "Could not find the table" in err_str:
                SupabaseTableCollection.missing_tables.add(self.table_name)
                return await self._get_fallback().update_one(filter_query, update_doc, upsert)
            if ("42703" in err_str or "PGRST204" in err_str or "schema cache" in err_str) and self.table_name == "users":
                clean_data.pop("subscription_tier", None)
                if clean_data:
                    try:
                        req = self.client.table(self.table_name).update(clean_data)
                        for k, v in filter_query.items():
                            col = "id" if k == "_id" else k
                            req = req.eq(col, v)
                        res = req.execute()
                        count = len(res.data) if res.data else 0
                        return UpdateResult(count, count)
                    except Exception:
                        pass
                return UpdateResult(1, 1)
            logger.error(f"Supabase update_one error on table {self.table_name}: {e}")
            return UpdateResult(0, 0)

    async def delete_one(self, query: Dict[str, Any]):
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count

        try:
            req = self.client.table(self.table_name).delete()
            for k, v in query.items():
                col = "id" if k == "_id" else k
                req = req.eq(col, v)
            res = req.execute()
            count = len(res.data) if res.data else 0
            return DeleteResult(count)
        except Exception as e:
            logger.error(f"Supabase delete_one error on table {self.table_name}: {e}")
            return DeleteResult(0)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        try:
            req = self.client.table(self.table_name).select("id", count="exact")
            if query:
                for k, v in query.items():
                    col = "id" if k == "_id" else k
                    req = req.eq(col, v)
            res = req.execute()
            return res.count or 0
        except Exception as e:
            logger.error(f"Supabase count_documents error on {self.table_name}: {e}")
            return 0


class SupabaseDatabaseAdapter:
    """Provides collection-like table indexing over Supabase."""
    def __init__(self, client: supabase.Client):
        self.client = client
        self.tables: Dict[str, SupabaseTableCollection] = {}

    def __getitem__(self, table_name: str) -> SupabaseTableCollection:
        if table_name not in self.tables:
            self.tables[table_name] = SupabaseTableCollection(self.client, table_name)
        return self.tables[table_name]


class SupabaseManager:
    client: Optional[supabase.Client] = None
    db: Optional[Any] = None
    is_connected: bool = False
    is_fallback: bool = False

    @classmethod
    async def connect(cls):
        url = (os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
        key = (
            os.getenv("SUPABASE_SECRET_KEY")
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
            or os.getenv("SUPABASE_KEY") 
            or os.getenv("SUPABASE_PUBLISHABLE_KEY")
            or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") 
            or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") 
            or ""
        ).strip()

        if url and key and not url.startswith("your_") and not key.startswith("your_"):
            try:
                logger.info(f"Connecting to Supabase at {url}...")
                cls.client = supabase.create_client(url, key)
                # Verify connectivity by testing a light select
                cls.client.table("users").select("id").limit(1).execute()
                cls.db = SupabaseDatabaseAdapter(cls.client)
                cls.is_connected = True
                cls.is_fallback = False
                logger.info("Successfully connected to Supabase PostgreSQL database.")
                return
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}. Falling back to high-performance Async InMemory Datastore.")
        else:
            logger.info("SUPABASE_URL or SUPABASE_KEY not configured. Running with Async InMemory Datastore fallback.")

        # Fallback
        cls.client = None
        cls.db = InMemoryDatabase("supabase_fallback")
        cls.is_connected = False
        cls.is_fallback = True

    @classmethod
    def get_database(cls) -> Any:
        if cls.db is None:
            cls.db = InMemoryDatabase("supabase_fallback")
            cls.is_fallback = True
        return cls.db

    @classmethod
    def get_client(cls) -> Optional[supabase.Client]:
        return cls.client


async def get_supabase_db() -> Any:
    """Dependency injection provider for Supabase database."""
    return SupabaseManager.get_database()
