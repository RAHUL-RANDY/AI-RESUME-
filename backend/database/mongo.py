import os
import logging
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("career_intelligence.database")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "career_intelligence")

class InMemoryCollection:
    """Async fallback collection mimicking Motor collection interface when Mongo is offline."""
    def __init__(self, name: str):
        self.name = name
        self.docs: List[Dict[str, Any]] = []

    async def find_one(self, query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        for doc in self.docs:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                res = doc.copy()
                if projection and projection.get("_id") == 0:
                    res.pop("_id", None)
                return res
        return None

    async def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        class AsyncCursor:
            def __init__(self, docs):
                self._docs = docs
                self._limit = None
                self._skip = 0

            def sort(self, key, direction=1):
                reverse = direction < 0
                self._docs = sorted(self._docs, key=lambda d: d.get(key, 0) or 0, reverse=reverse)
                return self

            def limit(self, n: int):
                self._limit = n
                return self

            def skip(self, n: int):
                self._skip = n
                return self

            async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
                docs = self._docs[self._skip:]
                if length is not None:
                    docs = docs[:length]
                return docs

            def __aiter__(self):
                self._iter = iter(self._docs)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration

        matching = []
        for doc in self.docs:
            if not query:
                matching.append(doc.copy())
            else:
                match = True
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    matching.append(doc.copy())
        return AsyncCursor(matching)

    async def insert_one(self, doc: Dict[str, Any]):
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id

        d = doc.copy()
        if "_id" not in d:
            import uuid
            d["_id"] = str(uuid.uuid4())
        self.docs.append(d)
        return InsertResult(d["_id"])

    async def update_one(self, filter_query: Dict[str, Any], update_doc: Dict[str, Any], upsert: bool = False):
        class UpdateResult:
            def __init__(self, matched_count, modified_count, upserted_id=None):
                self.matched_count = matched_count
                self.modified_count = modified_count
                self.upserted_id = upserted_id

        for i, doc in enumerate(self.docs):
            match = True
            for k, v in filter_query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update_doc:
                    self.docs[i].update(update_doc["$set"])
                else:
                    self.docs[i].update(update_doc)
                return UpdateResult(1, 1)

        if upsert:
            new_doc = filter_query.copy()
            if "$set" in update_doc:
                new_doc.update(update_doc["$set"])
            else:
                new_doc.update(update_doc)
            import uuid
            new_doc["_id"] = str(uuid.uuid4())
            self.docs.append(new_doc)
            return UpdateResult(0, 0, new_doc["_id"])

        return UpdateResult(0, 0)

    async def delete_one(self, query: Dict[str, Any]):
        class DeleteResult:
            def __init__(self, deleted_count):
                self.deleted_count = deleted_count

        for i, doc in enumerate(self.docs):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                self.docs.pop(i)
                return DeleteResult(1)
        return DeleteResult(0)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self.docs)
        count = 0
        for doc in self.docs:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                count += 1
        return count


class InMemoryDatabase:
    """Async fallback database."""
    def __init__(self, name: str):
        self.name = name
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]


class DatabaseManager:
    client: Optional[Any] = None
    db: Optional[Any] = None
    is_fallback: bool = False
    active_backend: str = "in_memory"

    @classmethod
    async def connect(cls):
        # 1. Primary: Try Supabase if credentials are provided
        supabase_url = (os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "").strip()
        supabase_key = (
            os.getenv("SUPABASE_SECRET_KEY")
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
            or os.getenv("SUPABASE_KEY") 
            or os.getenv("SUPABASE_PUBLISHABLE_KEY")
            or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") 
            or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") 
            or ""
        ).strip()

        if supabase_url and supabase_key and not supabase_url.startswith("your_") and not supabase_key.startswith("your_"):
            try:
                from backend.database.supabase_client import SupabaseManager
                await SupabaseManager.connect()
                if SupabaseManager.is_connected:
                    cls.db = SupabaseManager.get_database()
                    cls.client = SupabaseManager.get_client()
                    cls.is_fallback = False
                    cls.active_backend = "supabase"
                    logger.info("DatabaseManager actively utilizing Supabase (PostgreSQL).")
                    return
            except Exception as e:
                logger.warning(f"Supabase connection attempt failed: {e}. Checking MongoDB.")

        # 2. Secondary: Try MongoDB if configured
        try:
            logger.info(f"Connecting to MongoDB at {MONGO_URI}...")
            client = AsyncIOMotorClient(
                MONGO_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000,
                maxPoolSize=20,
                minPoolSize=5
            )
            # Test ping
            await client.admin.command('ping')
            cls.client = client
            cls.db = client[MONGO_DB_NAME]
            cls.is_fallback = False
            cls.active_backend = "mongodb"
            logger.info(f"Successfully connected to MongoDB ({MONGO_DB_NAME})")
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}. Utilizing high-performance Async InMemory Datastore.")
            cls.client = None
            cls.db = InMemoryDatabase(MONGO_DB_NAME)
            cls.is_fallback = True
            cls.active_backend = "in_memory"

    @classmethod
    async def close(cls):
        if cls.client and hasattr(cls.client, "close"):
            try:
                cls.client.close()
                logger.info("Closed database connection.")
            except Exception:
                pass

    @classmethod
    def get_database(cls) -> Any:
        if cls.db is None:
            cls.db = InMemoryDatabase(MONGO_DB_NAME)
            cls.is_fallback = True
            cls.active_backend = "in_memory"
        return cls.db


async def get_db() -> Any:
    """FastAPI Dependency for database access."""
    return DatabaseManager.get_database()
