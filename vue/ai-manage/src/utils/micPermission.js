/**
 * 麦克风权限预热工具
 *
 * 背景：getUserMedia 首次使用时必然弹出浏览器授权框（安全红线，无法绕过）。
 * 预热思路：在用户第一次自然手势（切到语音模式 / 切到实时传译）时就提前请求一次
 * 权限并立即释放，把"措手不及的弹窗"转移到可预期的交互节点，后续真正录音零打断。
 *
 * 设计说明（为什么不做状态缓存 / permissions.query 分流）：
 *   1. getUserMedia 在 granted/denied 下都是立即返回（成功/失败），无弹窗也几乎零成本，
 *      重复调用没有意义开销，因此本函数无内部状态、每次真实请求，天然健壮：
 *      - 用户中途在浏览器设置里改了权限 → 下次调用自然反映，不会因旧缓存误判；
 *      - 设备被占用（NotReadableError）等非权限错误 → 不标记为 denied，下次可重试。
 *   2. 权限请求必须在用户手势 activation 窗口内发起（Firefox/Safari 尤其严格），
 *      因此本函数体内【第一个 await 之前】同步调用 getUserMedia，调用方只需在
 *      事件处理器内直接调用即可（不要先 await 其它探测再调本函数）。
 */

/** 权限类拒绝错误码（其余如 NotReadableError/NotFoundError 属设备问题，非权限问题） */
const PERMISSION_DENIED_CODES = new Set(['NotAllowedError', 'SecurityError'])

/**
 * 预热麦克风权限：请求一次权限并立即释放（不采音、指示灯熄灭、不占用麦克风）
 *
 * @returns {Promise<{ ok: boolean, state: 'granted' | 'denied' | 'error' | 'unsupported' }>}
 *   - granted: 授权成功（后续 getUserMedia 不再弹窗）
 *   - denied:  用户明确拒绝（引导去浏览器站点设置开启）
 *   - error:   设备被占用 / 无设备等非权限问题（提示排查设备，可重试）
 *   - unsupported: 非安全上下文(HTTP)或浏览器不支持（mediaDevices 不存在）
 */
export async function prewarmMicrophone() {
  const getUserMedia = navigator.mediaDevices?.getUserMedia
  if (!getUserMedia) {
    // 非安全上下文（HTTP）或旧浏览器：无 mediaDevices，只能提示升级/换 HTTPS
    return { ok: false, state: 'unsupported' }
  }
  try {
    // 同步发起请求：保持在用户手势 activation 窗口内（不要在前面加任何 await）
    const stream = await getUserMedia.call(navigator.mediaDevices, { audio: true })
    // 拿到即释放：只"提权"，不占用麦克风（否则系统指示灯常亮、影响其他应用）
    stream.getTracks().forEach((track) => track.stop())
    return { ok: true, state: 'granted' }
  } catch (err) {
    const name = err && err.name
    if (PERMISSION_DENIED_CODES.has(name)) return { ok: false, state: 'denied' }
    return { ok: false, state: 'error' }
  }
}