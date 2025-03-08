import { useCreateSessionKey, useCurrentAddress } from '@roochnetwork/rooch-sdk-kit';
import { MODULE_ADDRESS } from '../config/constants';

export function useSessionKey() {
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const addr = useCurrentAddress();

  // 检查本地存储中是否有有效的 session key
  const checkSessionKey = async (): Promise<boolean> => {
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
      return true;
    } catch (e: any) {
      return false;
    }
  };

  return {
    checkSessionKey,
    createSession,
  };
}