#!/bin/bash

rm -rf .dist

apps=("third-person-shooter")

for i in ${!apps[@]};
do
  app=${apps[$i]}
  
  mkdir -p .dist
  cd $app && npm run build && cd ..
  mkdir -p .dist/${app}
  cp -R ./${app}/dist/* ./.dist/${app}/
done
