import axios, { Axios } from "axios";
import environments from "../environments";
class SurfApiHelper {
  axios: Axios
  apiEnvironment: any
  constructor(private authToken: string, apiEnvironmentName: string = null) {
    this.apiEnvironment = environments[apiEnvironmentName] || environments['prod2']
    this.axios = axios.create({
      baseURL: this.apiEnvironment.V2_BASEURL,
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