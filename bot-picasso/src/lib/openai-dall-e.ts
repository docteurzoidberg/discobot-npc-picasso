import * as dotenv from 'dotenv';

dotenv.config({
  path:
    `${__dirname}/../../.env` +
    (process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''),
});

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function getDallEImage(prompt, avatarUrl: string = '') {
  //TODO: handle avatar when api permits

  // Generate image from prompt
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: '512x512',
  });
  return response.data.data[0].url;
}
