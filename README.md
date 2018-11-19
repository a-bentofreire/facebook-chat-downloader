## Description

`facebook-chat-download` is an unofficial facebook chat message downloader command line utility.  
It's designed to simplify the retrieval of the chat messages for a list of users.  
It uses [facebook-chat-api](https://www.npmjs.com/package/facebook-chat-api) library to retrieve the data from facebook.
  
`facebook-chat-download` can login from email and password, if missing it will request a user prompt,
or from a state-file (generated if requested after the first successful login),
allowing to connect multiple times without requesting multiple times the email/password.

The file storage is done per chat name, where the filename has the symbols removed the chat name,
supporting the following file formats:

- raw `json` - the data is stored as it's retrieved from the `facebook-chat-api`.
- formatted `json` - the output is processed, according to the supplied field names.
- `txt` - a text file with one message per line.

## Installation

`[sudo] npm install -g facebook-chat-download`  

## Usage

`facebook-chat-download [options]`
  
Where the options are:  

| Short Name  | Long Name | Description |  
| ------------- | ------------- |------------- |  
|-e|--email|email<br><i>if email and input state file aren't present, it will request by user prompt</i>|
|-p|--password|password<br><i>if password and input state file aren't present, it will request by user prompt</i>|
|-s|--state-file|state filename<br><i>if `-S` isn't present, it will read state from this file<br>replacing the need of a password</i>|
|-S|--write-state-file|<i>if present, it will write the state to this file after successful login</i>|
|-t|--threads-file|chat threads filename<br><i>if `-T` isn't present, it will read threads from this file<br>replacing the need of an extra request</i>|
|-T|--write-threads-file|if present, it will write the threads file|
|-l|--limit|maximum number of chat threads<br><i>use this value, only if the chats to download are recent</i>|
|-g|--tag|list of chat types by tags<br>Possible values are `INBOX`,`ARCHIVED`,`PENDING`,`OTHER`|
|-n|--chat-name|list of chat names to download|
|-R|--raw|if present and output is in raw `json`, otherwise is in formatted `json`|
|-O|--output-folder|output folder<br><i>location where all the chat files will be stored</i>|
|-N|--output-field-name|list of fields names for non-raw storage<br><i>Possible values are:</i> `date`, `sender`, `message`|
|-F|--output-file-format|output file format. Either `txt` or `json`|
|-D|--output-date-format|output date-time format. see [moment.js](https://www.npmjs.com/package/moment)|
|-c|--convert|converts from raw chat file into another format<br><i>If it's present, it will bypass login,<br>and it will read from previously stored raw json files</i>|

## Examples

`facebook-chat-download -n 'My lunch group' -n 'Miss 王' -R`
  
It will prompt for the email and password associated with your facebook account,  
and store the chats in the files: `my-lunch-group.raw.json` and `miss-王.raw.json`.
  
`facebook-chat-download -e myfbemail@northpole.com -s state.json -S -O chats`
  
It will prompt for the password, store the state in `state.json` after successful login,  
and store all the chats in the folder `chats` in json format.
  
`facebook-chat-download -s state.json -t threads.json -T -n 'Hiking (weekend)' -F txt`
  
It will read the login from `state.json`, write the thead list in `threads.json`,  
download one chat and store it in text format on the file `hiking-weekend.txt`.
  
`facebook-chat-download -t threads.json -c -n 'My lunch group' -F txt -N date -N message -N sender`
  
It will read the previously stored `my-lunch-group.raw.json` and convert it into text format,  
with the message before the sender.

## Caveats

To prevent connection timeouts, facebook-chat-download downloads 50 messages packages,
and uses a recursive function to retrieve the next ones.
If a certain chat has too many messages, it can reach a stack overflow.

## License

[MIT License+uuid License](https://github.com/a-bentofreire/uuid-licenses/blob/master/MIT-uuid-license.md)

## Copyrights

(c) 2018 Alexandre Bento Freire
