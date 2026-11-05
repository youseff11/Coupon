import mimetypes

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class DatabaseStorage(Storage):
    """Keeps uploaded files (store logos) in the database.

    Used on hosts without a persistent disk such as Vercel, where anything
    written to the filesystem disappears between requests.
    """

    def _model(self):
        from .models import StoredFile
        return StoredFile

    def _open(self, name, mode='rb'):
        obj = self._model().objects.get(name=name)
        return ContentFile(bytes(obj.content), name=name)

    def _save(self, name, content):
        data = b''.join(content.chunks())
        content_type = (getattr(content, 'content_type', None)
                        or mimetypes.guess_type(name)[0] or 'application/octet-stream')
        self._model().objects.create(name=name, content=data, content_type=content_type, size=len(data))
        return name

    def exists(self, name):
        return self._model().objects.filter(name=name).exists()

    def delete(self, name):
        self._model().objects.filter(name=name).delete()

    def size(self, name):
        return self._model().objects.values_list('size', flat=True).get(name=name)

    def url(self, name):
        return settings.MEDIA_URL + name
