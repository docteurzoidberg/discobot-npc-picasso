import * as dotenv from 'dotenv';

dotenv.config({
  path:
    `${__dirname}/../../.env` +
    (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''),
});

import fetch = require('node-fetch');
import FormData = require('form-data');

const TPPT_TOKEN = process.env.TPPT_TOKEN || '';
const TPPT_URL = process.env.TPPT_URL || '';

//download image url from dalle to memory
const _downloadToMemory = async (url) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
};

//encode file buffer into multipart form data then uploads it to tppt.eu
const _uploadToTppt = async (buffer, headers) => {
  const form = new FormData();
  form.append('file', buffer, 'image.png');
  const response = await fetch(TPPT_URL, {
    method: 'POST',
    body: form,
    headers,
  });
  return response.json();
};

//download image from dalle then uploads it to tppt.eu and return url
export const dalle2tppt = async (
  dalleurl,
  author = 'npc-quests',
  color = '#73375e'
) => {
  const headers = {
    Authorization: TPPT_TOKEN,
    'X-Ass-OG-Author': author,
    'X-Ass-OG-Color': color,
    'X-Ass-OG-Provider': 'dalle',
  };
  const buffer = await _downloadToMemory(dalleurl);
  const response = await _uploadToTppt(buffer, headers);
  return response.resource + '/direct.png' || '';
};
