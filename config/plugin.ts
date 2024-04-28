import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  mongo: {
    enable: false,
    package: 'egg-mongo-native',
  },
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
};

export default plugin;
