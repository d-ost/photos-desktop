/**
 * Request Manager
 *
 * @module lib/request
 */
const https = require('https')
  , http = require('http')
  , url = require('url')

const rootPrefix = '..'
  , httpUserAgent = 'photos-desktop'

const DEBUG = ('true' === process.env.DEBUG)

export default class Request {

  private readonly apiEndpoint: string
  private readonly timeOut: number

  constructor(params: any) {
    this.apiEndpoint = params.apiEndpoint
    const config = params.config || {}
    this.timeOut = config.timeout * 1000 || 15000
  }

  /**
   * Send get request
   *
   * @param {string} resource - API Resource
   * @param {object} queryParams - resource query parameters
   *
   * @public
   */
  get(resource: string, queryParams: any) {
    return this._send('GET', resource, queryParams)
  }

  /**
   * Send post request
   *
   * @param {string} resource - API Resource
   * @param {object} queryParams - resource query parameters
   *
   * @public
   */
  post(resource: string, queryParams: any) {
    return this._send('POST', resource, queryParams)
  }

  /**
   * Get parsed URL
   *
   * @param {string} resource - API Resource
   *
   * @return {object} - parsed url object
   *
   * @private
   */
  _parseURL(resource: string) {
    return url.parse(this.apiEndpoint + resource)
  }

  /**
   * Send request
   *
   * @param {string} requestType - API request type
   * @param {string} resource - API Resource
   * @param {object} requestData - resource query parameters
   *
   * @private
   */
  _send(requestType: string, resource: string, requestData: any) {
    const oThis = this
    const parsedURL = oThis._parseURL(resource)

    const options = {
      host: parsedURL.hostname,
      port: parsedURL.port,
      path: parsedURL.path,
      method: requestType,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': httpUserAgent
      }
    }

    if (requestType === 'GET' && requestData !== undefined) {
      options.path = options.path + '?' + requestData
    }

    if (DEBUG) {
      console.log('------------------------------')
      console.log('request OPTIONS \n', JSON.stringify(options))
      console.log('requestData \n', requestData)
    }

    return new Promise(async function (onResolve: any, onReject: any) {

      let chunkedResponseData = ''

      const request = (parsedURL.protocol === 'https:' ? https : http).request(options, function (response: any) {

        response.setEncoding('utf8')

        response.on('data', function (chunk: any) {
          chunkedResponseData += chunk
        })

        response.on('end', function () {
          const parsedResponse = oThis._parseResponse(chunkedResponseData, response)
          if (DEBUG) {
            console.log('parsedResponse \n', JSON.stringify(parsedResponse))
            console.log('------------------------------')
          }

          if (parsedResponse.success) {
            onResolve(parsedResponse)
          } else {
            onReject(parsedResponse)
          }
        })

      })

      request.on('socket', function (socket: any) {
        socket.setTimeout(oThis.timeOut)
        socket.on('timeout', function (e: any) {
          onReject({
            success: false,
            err: {code: 'GATEWAY_TIMEOUT'}
          })
        })
      })

      request.on('error', function (e: any) {

        console.error('Request error')
        console.error(e)
        const parsedResponse = oThis._parseResponse(e, {})
        if (parsedResponse.success) {
          onResolve(parsedResponse)
        } else {
          onReject(parsedResponse)
        }

      })

      if (requestType === 'POST' && requestData !== undefined) {
        request.write(requestData)
      }
      request.end()
    })
  }

  /**
   * Parse response
   *
   * @param {string} responseData - Response data
   * @param {object} response - Response object
   *
   * @private
   */
  _parseResponse(responseData: any, response: any) {
    const responseStatusCode = (response || {}).statusCode
    if (responseData === undefined || responseStatusCode !== 200) {
      responseData = responseData || `{'err': {'code': ${responseStatusCode}}}`
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseData)
    } catch (e) {
      console.error('Response parsing error')
      console.error(e)
      parsedResponse = {
        err: {
          code: 'SOMETHING_WENT_WRONG'
        }
      }
    }

    return parsedResponse
  }

}