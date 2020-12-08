import { KJUR } from 'jsrsasign'

//jwt头部，默认使用HS256算法进行加密
const jwtHeader = { alg: 'HS256', cty: 'JWT' }

/**
 * 生成一个jwt
 * @param payload   传输时需要封装的数据
 * @return {string}
 */
export function generateJwt(payload) {}

/**
 * 从jwt中获取payload对象，即封装传输数据的对象
 * @param jwt       json web token
 * @return {*}
 */
export function getPayloadObjFromJwt(jwt) {
  return KJUR.jws.JWS.parse(jwt).payloadObj
}

/**
 * jwt签名验证
 * @param jwt       json web token
 */
export function verifyJwt(jwt) {}
