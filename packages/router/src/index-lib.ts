/**
 * @ldesign/router - UMD Library Entry
 * 
 * This file serves as the UMD build entry point for the router library.
 * It exports all public APIs for browser usage via script tags.
 */

// Re-export everything from main index
// For UMD builds, also export a default object containing all exports
import * as RouterLib from './index'

export * from './index'
export default RouterLib