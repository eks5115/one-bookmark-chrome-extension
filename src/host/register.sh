#!/usr/bin/env bash

set -e

BASE_PATH=$(cd `dirname $0`; pwd)

register() {
  CHROME_NATIVE_MESSAGE_PATH="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"

  awk -v hostPath=${BASE_PATH}/${hostName}.js '{if (NR==1 && $0 != "#!/usr/local/bin/node") print "#!/usr/local/bin/node">hostPath; print $0>>hostPath;}' ${BASE_PATH}/host.js

  HOST_PATH=${BASE_PATH}/${hostName}.js
  HOST_MANIFEST_PATH=${BASE_PATH}/${hostName}.json

  HOST_CHROME_PATH=${CHROME_NATIVE_MESSAGE_PATH}/${hostName}.js

  ESCAPED_HOST_CHROME_PATH=${HOST_CHROME_PATH////\\/}
  sed -i '' "/path/{s/.*/  \"path\":\"${ESCAPED_HOST_CHROME_PATH}\",/;}" ${HOST_MANIFEST_PATH}
  sed -i '' "/chrome-extension/{s/.*/    \"chrome-extension:\/\/${extensionID}\/\"/;}" ${HOST_MANIFEST_PATH}

  chmod +x "${HOST_PATH}"
  cp ${HOST_PATH} "${CHROME_NATIVE_MESSAGE_PATH}"
  cp ${HOST_MANIFEST_PATH} "${CHROME_NATIVE_MESSAGE_PATH}"
}

while getopts n:i: opt;
do
  case ${opt} in
    n)
      hostName=(${OPTARG//,/ })
      ;;
    i)
      extensionID=(${OPTARG//,/ })
      ;;
    ?)
      exit 1
      ;;
   esac
done

if [[ -z ${hostName} || -z ${extensionID} ]];then
  exit 1
fi

register