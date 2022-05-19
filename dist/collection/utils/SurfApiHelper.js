import axios from "axios";
const V2_BASEURL = 'https://api.stage2.surfsight.net/v2';
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
