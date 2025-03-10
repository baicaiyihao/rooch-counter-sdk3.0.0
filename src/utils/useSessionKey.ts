import { useCreateSessionKey, useCurrentAddress } from '@roochnetwork/rooch-sdk-kit';
import { MODULE_ADDRESS, APP_VERSION } from '../config/constants'; // 假设 APP_VERSION 已定义

export function useSessionKey() {
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const addr = useCurrentAddress();

  // 检查版本并清除不匹配的 sessionKey
  const checkAndClearVersion = () => {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== APP_VERSION) {
      console.log(`Version mismatch: stored=${storedVersion}, current=${APP_VERSION}, clearing session keys`);
      // 清除所有以 sessionKey_ 开头的本地存储项
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sessionKey_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('appVersion', APP_VERSION); // 更新版本号
    }
  };

  // 检查本地存储中是否有有效的 session key
  const checkSessionKey = async (): Promise<boolean> => {
    checkAndClearVersion(); // 在检查 sessionKey 前验证版本
    if (!addr) return false;
    const sessionKeyData = localStorage.getItem(`sessionKey_${addr.toStr()}`);
    if (sessionKeyData) {
      const { expiresAt } = JSON.parse(sessionKeyData);
      const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
      if (now < expiresAt) {
        return true; // session key 未过期
      } else {
        localStorage.removeItem(`sessionKey_${addr.toStr()}`); // 删除过期的 session key
      }
    }
    return false;
  };

  // 创建新的 session key 并存储
  const createSession = async (): Promise<boolean> => {
    if (!addr) return false;
    try {
      await createSessionKey({
        appName: 'Fate X',
        appUrl: 'https://fatex.zone',
        scopes: [`${MODULE_ADDRESS}::*::*`],
        maxInactiveInterval: 86400, // 1 天有效期
      });
      const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 设置过期时间
      localStorage.setItem(
        `sessionKey_${addr.toStr()}`,
        JSON.stringify({ expiresAt })
      );
      localStorage.setItem('appVersion', APP_VERSION); // 更新版本号
      return true;
    } catch (e: any) {
      console.error('Failed to create session key:', e.message);
      return false;
    }
  };

  return {
    checkSessionKey,
    createSession,
  };
}