import axios from "axios";
import { Env } from '@stencil/core';
console.log(Env);
const V2_BASEURL = Env.V2_BASEURL;
class SurfApiHelper {
  constructor(authToken) {
    this.authToken = authToken;
    this.axios = axios.create({
      baseURL: V2_BASEURL,
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    });
  }
  async prepareDeviceMediaStreaming(imei) {
    const { data: { data } } = await this.axios.request({
      method: 'POST',
      url: `/devices/${imei}/connect-media`
    });
    return data;
  }
}
export default SurfApiHelper;
