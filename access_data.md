### Stored data is compressed
-----
**Datetypes**:
  * [JSON](http://www.json.org/)
  * [WAV](https://en.wikipedia.org/wiki/WAV)
  * [AMR](https://en.wikipedia.org/wiki/Adaptive_Multi-Rate_audio_codec)
----
## How to decompress

  1. Download data from Girder server
  2. Use `LZString.decompressFromEncodedURIComponent` on file content.
    - [Javascript](https://github.com/pieroxy/lz-string)
    - [Python](https://github.com/marcel-dancak/lz-string-python)
  3. **JSON**
    * Returned as string
  4.  **WAV/AMR**
    * Returned as string
    * Split string by `,` and take the second item
    * Encode the string to bytes
    * Decode the `Base64` encoded bytes
    * Write bytes to file


  *Sample python decompression script below*
```python
from lzstring import LZString
import base64
import json

def read_file(fl):
    """
    Opens and returns a file's content

    Parameter
    ---------
    fl : string
        Absolute path to file

    Returns
    -------
    fp : string
        File contents

    """
    with open(fl, 'r') as fp:
        return fp.read()

def uncompress_json(fl):
    """
    Use LZString decompression on compressed Girder files.
    Intended use is for MIT VoiceUp project.

    Parameters
    ----------
    fl : string
        Absolute path to compressed json file

    Returns
    -------
    jd : list of dicts
        Responses as dictionary
    """
    return json.loads(
        LZString.decompressFromEncodedURIComponent(read_file(fl))
    )

def uncompress_audio(fl):
    """
    Use LZString decompression on compressed Girder files.

    Parameters
    ----------
    fl : string
        Absolute path to compressed audio file

    Returns
    -------
    ab : bytes
        Byte stream of file

    """
    data = LZString.decompressFromEncodedURIComponent(read_file(fl))
    return data.split(',')[1].encode()

def write_audio_data(data, outfile):
    """
    Write audio byte data to an outfile.
    Supports both WAV/AMR extensions.

    Parameters
    ----------
    data : bytes
        Uncompressed audio data
    outfile : string
        Absolute path of output file to write

    Returns
    -------
    None

    """

    bytedata = base64.b64decode(data)

    with open(outfile, 'wb') as fp:
        fp.write(bytedata)
```
