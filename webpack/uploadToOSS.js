/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const OSS = require('ali-oss');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const publicPath = path.resolve(__dirname, '../app/public');

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
});

async function run() {
  const publicFiles = fs.readdirSync(publicPath);
  const files = publicFiles.filter((file) => file !== 'page.tpl');
  const res = await Promise.all(
    files.map(async (fileName) => {
      const savedOSSPath = path.join('h5-assets', fileName);
      const filePath = path.join(publicPath, fileName);
      const result = await client.put(savedOSSPath, filePath);
      const { url } = result;
      return url;
    })
  )
  console.log('上传成功', res);
}

run();