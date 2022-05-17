import axios, { Axios } from "axios";
const V2_BASEURL = 'https://api.stage2.surfsight.net/v2'
class SurfApiHelper {
  axios: Axios
  constructor(private authToken: string) {
    this.axios = axios.create({
      baseURL: V2_BASEURL,
      headers: {
        Authorization: `Bearer ${this.authToken}`
      }
    })
  }

  async prepareDeviceMediaStreaming(imei: string) {
    const { data: { data }} = await this.axios.request({
      method: 'POST',
      url: `/devices/${imei}/connect-media`
    })
    return data as {
      address: string,
      mediaToken: string
    }
  }
}
export default SurfApiHelper