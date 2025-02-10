import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for policies
const policies = new Map()
let nextPolicyId = 1

// Mock functions to simulate contract behavior
function createPolicy(
    owner: string,
    premium: number,
    coverage: number,
    startDate: number,
    endDate: number,
    parameters: Array<{ key: string; value: string }>,
) {
  if (endDate <= startDate) throw new Error("Invalid dates")
  const policyId = nextPolicyId++
  policies.set(policyId, { owner, premium, coverage, startDate, endDate, isActive: true, parameters })
  return policyId
}

function cancelPolicy(policyId: number, sender: string) {
  const policy = policies.get(policyId)
  if (!policy) throw new Error("Policy not found")
  if (policy.owner !== sender) throw new Error("Unauthorized")
  policy.isActive = false
  policies.set(policyId, policy)
  return true
}

function getPolicy(policyId: number) {
  return policies.get(policyId)
}

function isPolicyActive(policyId: number) {
  const policy = policies.get(policyId)
  return policy ? policy.isActive : false
}

describe("Policy Contract", () => {
  beforeEach(() => {
    policies.clear()
    nextPolicyId = 1
  })
  
  it("should create a policy", () => {
    const policyId = createPolicy("owner1", 100, 1000, 1000, 2000, [{ key: "weather", value: "sunny" }])
    expect(policyId).toBe(1)
    const policy = getPolicy(policyId)
    expect(policy).toBeDefined()
    expect(policy.owner).toBe("owner1")
    expect(policy.isActive).toBe(true)
  })
  
  it("should not create a policy with invalid dates", () => {
    expect(() => createPolicy("owner1", 100, 1000, 2000, 1000, [])).toThrow("Invalid dates")
  })
  
  it("should cancel a policy", () => {
    const policyId = createPolicy("owner1", 100, 1000, 1000, 2000, [])
    const result = cancelPolicy(policyId, "owner1")
    expect(result).toBe(true)
    expect(isPolicyActive(policyId)).toBe(false)
  })
  
  it("should not cancel a policy if not the owner", () => {
    const policyId = createPolicy("owner1", 100, 1000, 1000, 2000, [])
    expect(() => cancelPolicy(policyId, "owner2")).toThrow("Unauthorized")
  })
  
  it("should check if a policy is active", () => {
    const policyId = createPolicy("owner1", 100, 1000, 1000, 2000, [])
    expect(isPolicyActive(policyId)).toBe(true)
    cancelPolicy(policyId, "owner1")
    expect(isPolicyActive(policyId)).toBe(false)
  })
})

