
// Safari (desktop) and iOS (every browser there is WebKit under the hood) fall noticeably
// behind Chromium on sustained canvas + compositing work, so they get lighter-weight settings.
export const isWebKitConstrainedEnvironment = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isDesktopSafari = /^((?!chrome|crios|fxios|android|edg).)*safari/i.test(userAgent)

  return isIOS || isDesktopSafari
}

