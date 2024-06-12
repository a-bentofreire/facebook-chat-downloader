# Description

`facebook-chat-downloader` is an unofficial facebook chat messages downloader command line utility.  
It's designed to simplify the retrieval of the chat messages of a list of users.  
It uses [facebook-chat-api](https://www.npmjs.com/package/facebook-chat-api) library to retrieve the data from facebook.
  
`facebook-chat-downloader` can login from an email and password from command line options, user prompt,
or from a state-file (generated if requested after the first successful login),
allowing to connect multiple times without requesting multiple times the email/password.

The file storage is done per chat name, usually the username, where the filename is the chat name with the symbols removed,
supporting the following file formats:

- raw `json` - the data is stored as it's retrieved from the `facebook-chat-api`.
- formatted `json` - the output is processed, according to the supplied field names.
- `txt` - a text file with one message per line.

## Installation

`[sudo] npm install -g facebook-chat-downloader`

## Usage

`facebook-chat-downloader [options]`
  
Where the options are:  

| Short Name  | Long Name | Description |  
| ------------- | ------------- |------------- |  
|-e|--email|email<br><i>if email and input state file aren't present, it will request by user prompt</i>|
|-p|--password|password<br><i>if password and input state file aren't present, it will request by user prompt</i>|
|-s|--state-file|state filename<br><i>if `-S` isn't present, it will read state from this file<br>replacing the need of an email and password</i>|
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

`facebook-chat-downloader -n 'My lunch group' -n 'Miss 王' -R`
  
It will prompt for the email and password associated with your facebook account,  
and store the chats in the files: `my-lunch-group.raw.json` and `miss-王.raw.json`.
  
`facebook-chat-downloader -e myfbemail@northpole.com -s state.json -S -O chats`
  
It will prompt for the password, store the state in `state.json` after successful login,  
and store all the chats in the folder `chats` in json format.
  
`facebook-chat-downloader -s state.json -t threads.json -T -n 'Hiking (weekend)' -F txt`
  
It will read the login from `state.json`, write the thead list in `threads.json`,  
download one chat and store it in text format on the file `hiking-weekend.txt`.
  
`facebook-chat-downloader -t threads.json -c -n 'My lunch group' -F txt -N date -N message -N sender`
  
It will read the previously stored `my-lunch-group.raw.json` and convert it into text format,  
with the message before the sender.

## Caveats

To prevent connection timeouts, facebook-chat-downloader downloads a 50 messages package,
and then it uses a recursive function to retrieve the next one package.
If a certain chat has too many messages, it could reach a stack overflow.

## License

MIT License

## Copyrights

(c) 2018-2024 Alexandre Bento Freire
