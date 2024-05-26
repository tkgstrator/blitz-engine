#!/bin/bash

if [ ! -e engine/eval/nn.bin ]; then
  mkdir -p engine/eval
  wget -O engine/eval/nn.bin https://github.com/HiraokaTakuya/get_suisho5_nn/raw/master/suisho5_nn/nn.bin
else
  echo "EVAL FILE IS ALREADY EXISTS"
fi

if [ ! -e engine/book/user_book1.db ]; then
  mkdir -p engine/book
  wget https://github.com/yaneurao/YaneuraOu/releases/download/BOOK-100T-Shock/100T-shock-book.zip
  unzip -o 100T-shock-book.zip user_book1.db -d engine/book
  rm 100T-shock-book.zip
else
  echo "USER BOOK FILE IS ALREADY EXISTS"
fi

if [ ! -e engine/YaneuraOu-by-gcc ]; then
  git clone https://github.com/yaneurao/YaneuraOu
  (cd YaneuraOu/source && make clean tournament TARGET_CPU=OTHER YANEURAOU_EDITION=YANEURAOU_ENGINE_NNUE COMPILER=g++)
  mv YaneuraOu/source/YaneuraOu-by-gcc engine/YaneuraOu-by-gcc
  rm -rf YaneuraOu
else
  echo "SHOGI ENGINE FILE IS ALREADY EXISTS"
fi

bun run dev