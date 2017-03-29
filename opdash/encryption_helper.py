# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Encryption / Decryption bits based on Eli Bendersky's PyCrypto example
# and Scott Brown's comment located at
# http://eli.thegreenplace.net/2010/06/25/
#     aes-encryption-of-files-in-python-with-pycrypto
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
from Crypto.Cipher import AES
from cStringIO import StringIO
import struct
import os
# TODO(Team): Consolidate decrypt_file and decrypt_file_to_string

AES_MODE = AES.MODE_CBC
IVEC_SIZE = 16
DEFAULT_CHUNK_SIZE = 64 * 1024
FILE_LENGTH_FIELD_SIZE = struct.calcsize('Q')  # Unsigned long
OUTPUT_FILE_DEFAULT_SUFFIX = '.enc'
WHENCE_EOF = 2  # Indicator for moving file pointer relative to EOF


def encrypt_file(key, in_filename, out_filename=None,
                 chunk_size=DEFAULT_CHUNK_SIZE):
    """Encrypts a file using AES (CBC mode) with the given key.

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param in_filename: Name of the input file.
    :param out_filename: Name of the output file. If None, '<in_filename>.enc'
                         will be used.
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type in_filename: str
    :type out_filename: str
    :type chunk_size: int
    """
    if not out_filename:
        out_filename = in_filename + OUTPUT_FILE_DEFAULT_SUFFIX

    with open(in_filename, 'rb') as infp:
        with open(out_filename, 'wb') as outfp:
            __encrypt(key, infp, outfp, chunk_size)


def encrypt_string(key, data, chunk_size=DEFAULT_CHUNK_SIZE):
    """Encrypts a file using AES (CBC mode) with the given key.

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param data: The string data to be encrypted
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type in_filename: str
    :type chunk_size: int
    """
    b = StringIO()
    __encrypt(key, StringIO(data), b, chunk_size)

    return b.getvalue()


def decrypt_file(key, in_filename, out_filename=None,
                 chunk_size=DEFAULT_CHUNK_SIZE):
    """Decrypts a file using AES (CBC mode) with the given key.

    Parameters are similar to encrypt_file, with one difference: out_filename,
    if not supplied, will be in_filename without it's last extension.
    Ex: 'aaa.yml.enc' becomes 'aaa.yml'

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param in_filename: Name of the input file.
    :param out_filename: Name of the output file. If None, '<in_filename>.xyz'
                         will become '<in_filename>'
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type in_filename: str
    :type out_filename: str
    :type chunk_size: int
    """
    if not out_filename:
        out_filename = os.path.splitext(in_filename)[0]

    with open(in_filename, 'rb') as infp:
        with open(out_filename, 'wb+') as outfp:
            __decrypt(key, infp, outfp, chunk_size)


def decrypt_file_to_string(key, in_filename, chunk_size=DEFAULT_CHUNK_SIZE):
    """Decrypts a file using AES (CBC mode) with the given key.

    Parameters are similar to encrypt_file, with one difference: out_filename,
    if not supplied, will be in_filename without it's last extension.
    Ex: 'aaa.yml.enc' becomes 'aaa.yml'

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param in_filename: Name of the input file.
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type in_filename: str
    :type chunk_size: int
    """
    with open(in_filename, 'rb') as infp:
        b = StringIO()
        __decrypt(key, infp, b, chunk_size)
        return b.getvalue()


def decrypt_string(key, encrypted, chunk_size=DEFAULT_CHUNK_SIZE):
    """Decrypts a file using AES (CBC mode) with the given key.

    Parameters are similar to encrypt_file, with one difference: out_filename,
    if not supplied, will be in_filename without it's last extension.
    Ex: 'aaa.yml.enc' becomes 'aaa.yml'

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param encrypted: Encrypted string to decrypt
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type encrypted: str
    :type chunk_size: int
    """
    b = StringIO()
    __decrypt(key, StringIO(encrypted), b, chunk_size)

    return b.getvalue()


def __decrypt(key, in_stream, out_stream, chunk_size=DEFAULT_CHUNK_SIZE):
    """Decrypts a file using AES (CBC mode) with the given key.

    Parameters are similar to encrypt_file, with one difference: out_filename,
    if not supplied, will be in_filename without it's last extension.
    Ex: 'aaa.yml.enc' becomes 'aaa.yml'

    :param key: The encryption key - a string that must be either 16, 24 or 32
                bytes long. Longer keys are more secure.
    :param encrypted: Encrypted string to decrypt
    :param chunk_size: Sets the size of the chunk which the function uses to
                       read and encrypt the file. Larger chunk sizes can be
                       faster for some files and machines. chunksize must be
                       divisible by 16.

    :type key: str
    :type in_stream: File
    :type chunk_size: int
    """
    ivec = in_stream.read(IVEC_SIZE)
    decryptor = AES.new(key, AES_MODE, ivec)

    # We need to read the next chunk to know how to treat this
    # first chunk.
    chunk = in_stream.read(chunk_size)
    final_chunk = False

    while True:

        # We need to read the new chunk to know how to treat
        # the current chunk.
        new_chunk = in_stream.read(chunk_size)

        plaintext_chunk = decryptor.decrypt(chunk)

        if len(new_chunk) == 0:
            final_chunk = True

        out_stream.write(plaintext_chunk)

        if final_chunk:
            # Read the expected file length from the now
            # complete reconstruction of the original file.
            # This moves the file pointer back from the end of
            # the file then reads the same number of bytes
            # back in, so should leave the file pointer at the
            # same position, but we break out of the read loop
            # anyway.
            out_stream.seek(-FILE_LENGTH_FIELD_SIZE, WHENCE_EOF)
            file_length_field = out_stream.read(FILE_LENGTH_FIELD_SIZE)
            orig_size = struct.unpack('<Q', file_length_field)[0]
            break

        chunk = new_chunk

    out_stream.truncate(orig_size)


def __encrypt(key, in_stream, out_stream, chunk_size=DEFAULT_CHUNK_SIZE):
    ivec = os.urandom(IVEC_SIZE)
    encryptor = AES.new(key, AES_MODE, ivec)

    # Get the size of the file (or StringIO) by seeking to the end.
    in_stream.seek(0, os.SEEK_END)
    file_size = in_stream.tell()
    in_stream.seek(0, os.SEEK_SET)

    file_length_field = struct.pack('<Q', file_size)

    assert len(ivec) == IVEC_SIZE
    out_stream.write(ivec)

    chunk = None
    final_chunk = False

    while True:

        # Encrypt the previous chunk, then read the next.
        if chunk is not None:
            out_stream.write(encryptor.encrypt(chunk))

        if final_chunk:
            break

        chunk = in_stream.read(chunk_size)

        # The first time we get anything other than a full
        # chunk, we've exhausted the input file and it's time
        # to add the padding and length indicator.
        if len(chunk) == 0 or len(chunk) % 16 != 0:
            padding_size = (
                16 - (len(chunk) + FILE_LENGTH_FIELD_SIZE) % 16
            )
            padding = ' ' * padding_size

            chunk += padding
            chunk += file_length_field
            assert len(chunk) % 16 == 0

            final_chunk = True
