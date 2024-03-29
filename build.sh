#!/bin/bash

rm -rf .dist

mkdir -p .dist
cp index.html ./.dist/

apps=("third-person-shooter")

for i in ${!apps[@]};
do
  app=${apps[$i]}
  
  mkdir -p .dist
  cd $app && npm ci && npm run build && cd ..
  mkdir -p .dist/${app}
  cp -R ./${app}/dist/* ./.dist/${app}/
done
