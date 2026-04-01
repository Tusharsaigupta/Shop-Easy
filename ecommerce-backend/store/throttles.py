from rest_framework.throttling import SimpleRateThrottle


class LoginIPThrottle(SimpleRateThrottle):
    scope = "login_ip"

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class LoginEmailThrottle(SimpleRateThrottle):
    scope = "login_email"

    def get_cache_key(self, request, view):
        email = (request.data.get("email") or "").strip().lower()
        if not email:
            return None

        return self.cache_format % {
            "scope": self.scope,
            "ident": email,
        }


class OrderWriteThrottle(SimpleRateThrottle):
    scope = "order_write"

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None

        return self.cache_format % {
            "scope": self.scope,
            "ident": str(request.user.pk),
        }


class ProfileWriteThrottle(SimpleRateThrottle):
    scope = "profile_write"

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None

        return self.cache_format % {
            "scope": self.scope,
            "ident": str(request.user.pk),
        }
