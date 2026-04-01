from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    if response.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
        error = "server_error"
    elif response.status_code == status.HTTP_401_UNAUTHORIZED:
        error = "unauthorized"
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        error = "forbidden"
    elif response.status_code == status.HTTP_404_NOT_FOUND:
        error = "not_found"
    elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        error = "rate_limited"
    else:
        error = "bad_request"

    payload = {
        "status_code": response.status_code,
        "error": error,
        "details": response.data,
    }

    return Response(payload, status=response.status_code, headers=response.headers)
