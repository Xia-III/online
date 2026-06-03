using IService;
using System.Collections.Concurrent;

namespace Net8WebApi.Utility
{
    public class MemoryTokenBlacklist : ITokenBlacklist
    {
        // 使用线程安全的集合
        private readonly ConcurrentDictionary<string, DateTime> _blacklist = new ConcurrentDictionary<string, DateTime>();

        public Task AddToBlacklistAsync(string jti, DateTime expiry)
        {
            _blacklist.TryAdd(jti, expiry);
            // 可以添加日志记录
            Console.WriteLine($"Token {jti} 已加入黑名单，过期时间：{expiry}");
            return Task.CompletedTask;
        }

        public Task<bool> IsInBlacklistAsync(string jti)
        {
            // 检查jti是否在黑名单中
            bool isInBlacklist = _blacklist.TryGetValue(jti, out DateTime expiry);
            if(isInBlacklist){
                        Console.WriteLine("失效时间"+expiry);
            }
            // 如果在黑名单中且已过期，则从黑名单中移除
            if (isInBlacklist && DateTime.UtcNow > expiry)
            {
                _blacklist.TryRemove(jti, out _);
                return Task.FromResult(false);
            }
            
            // 可以添加日志记录
            if (isInBlacklist)
            {
                Console.WriteLine($"Token {jti} 在黑名单中，验证失败");
            }
            
            return Task.FromResult(isInBlacklist);
        }
    }
}