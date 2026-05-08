import requests
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY


class SupabaseClient:
    def __init__(self):
        self.url = SUPABASE_URL
        self.headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        }

    def table(self, table_name: str):
        """Returns a table query builder."""
        return SupabaseQuery(self.url, table_name, self.headers)


class SupabaseQuery:
    def __init__(self, base_url: str, table_name: str, headers: dict):
        self.base_url = base_url
        self.table_name = table_name
        self.headers = headers
        self.url = f"{base_url}/rest/v1/{table_name}"
        self.filters = []
        self.order_by = None
        self.range_start = None
        self.range_end = None
        self.select_all = True

    def select(self, *args, **kwargs):
        """Select columns."""
        if "count" in kwargs:
            self.count = kwargs["count"]
        return self

    def eq(self, column: str, value):
        """Filter by equality."""
        self.filters.append(f"{column}=eq.{value}")
        return self

    def ilike(self, column: str, value: str):
        """Filter by ILIKE (case-insensitive like)."""
        self.filters.append(f"{column}=ilike.{value}")
        return self

    def order(self, column: str, desc: bool = False):
        """Order results."""
        direction = "desc" if desc else "asc"
        self.order_by = f"{column}.{direction}"
        return self

    def range(self, start: int, end: int):
        """Pagination range."""
        self.range_start = start
        self.range_end = end
        return self

    def execute(self):
        """Execute the query."""
        params = {}
        
        # Add filters
        for f in self.filters:
            params[f.split("=")[0]] = f.split("=", 1)[1]
        
        # Add ordering
        if self.order_by:
            params["order"] = self.order_by
        
        # Add range (for pagination)
        if self.range_start is not None and self.range_end is not None:
            headers = self.headers.copy()
            headers["Range"] = f"{self.range_start}-{self.range_end}"
        else:
            headers = self.headers
        
        response = requests.get(self.url, headers=headers, params=params)
        response.raise_for_status()
        
        return SupabaseResponse(response.json(), response.headers)

    def insert(self, data: dict):
        """Insert data and return it."""
        # Use Prefer header to request the inserted row to be returned
        headers = self.headers.copy()
        headers["Prefer"] = "return=representation"
        
        response = requests.post(self.url, headers=headers, json=data)
        response.raise_for_status()
        
        # Check if we got data back
        if response.text and response.text.strip():
            try:
                response_data = response.json()
                return SupabaseResponse(response_data, response.headers)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to parse response: {e}, body: {response.text}")
                return SupabaseResponse([], response.headers)
        else:
            # If still no data, return empty
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Insert successful (HTTP {response.status_code}) but no body returned")
            return SupabaseResponse([], response.headers)

    def delete(self):
        """Delete query builder."""
        return SupabaseDeleteQuery(self.url, self.headers, self.filters)


class SupabaseDeleteQuery:
    def __init__(self, url: str, headers: dict, filters: list):
        self.url = url
        self.headers = headers
        self.filters = filters

    def eq(self, column: str, value: str):
        """Add equality filter."""
        self.filters.append(f"{column}=eq.{value}")
        return self

    def execute(self):
        """Execute delete."""
        params = {}
        for f in self.filters:
            col, val = f.split("=", 1)
            params[col] = val
        
        response = requests.delete(self.url, headers=self.headers, params=params)
        response.raise_for_status()
        return SupabaseResponse({"success": True}, response.headers)


class SupabaseResponse:
    def __init__(self, data, headers):
        self.data = data if isinstance(data, list) else [data] if data else []
        self.headers = headers
        self.count = len(self.data)


# Global instance
_client = None


def get_supabase() -> SupabaseClient:
    global _client
    if _client is None:
        _client = SupabaseClient()
    return _client
