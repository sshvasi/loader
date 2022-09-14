import axios from 'axios';
import 'axios-debug-log';

const getUrl = (url, base) => new URL(url, base);

const load = async (url, options = {}) => {
  const { href } = url;
  const { data } = await axios.get(href, options);

  return data;
};

export { getUrl, load };
