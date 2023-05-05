export type VerifyStandardJsonInputParams = {
  bytecode: string
  bytecodeType: string
  compilerVersion: string
  input: string
}

export type VerifyMultiPartParams = {
  bytecode: string
  bytecodeType: string
  compilerVersion: string
  evmVersion?: string
  optimizationRuns?: number
  sourceFiles: Record<string, string>
  libraries?: Record<string, string>
}

export function verifyStandardJsonInput(params: VerifyStandardJsonInputParams) {
  const api = process.env.VERIFICATION_URL + '/api/v2/verifier/solidity/sources:verify-standard-json'
  return fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
}

export function verifyMultiPart(params: VerifyMultiPartParams) {
  const api = process.env.VERIFICATION_URL + '/api/v2/verifier/solidity/sources:verify-multi-part'
  return fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
}

export function getCompilerVersions() {
  const api = process.env.VERIFICATION_URL + '/api/v2/verifier/solidity/versions'
  return fetch(api, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
