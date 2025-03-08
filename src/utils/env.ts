// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

export function isMainNetwork() {

  if (typeof window !== 'undefined') {
    return (
      window.location.hostname === 'fatex.zone'
    )
  }
  return false
}
