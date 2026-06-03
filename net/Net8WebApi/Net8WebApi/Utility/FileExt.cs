using IService;
using Microsoft.Extensions.DependencyInjection;
using Model.EntityMap;
using System;

namespace Net8WebApi.Utility
{
        public static class FileExt
        {
                private static IServiceScopeFactory _serviceScopeFactory;

                public static void Initialize(IServiceProvider serviceProvider)
                {
                        _serviceScopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
                }

                // 辅助方法：更新文件使用状态
                public static async Task UpdateFileUsageStatus(string url, bool isUsed)
                {
                        if (string.IsNullOrEmpty(url)) return;

                        using (var scope = _serviceScopeFactory.CreateScope())
                        {
                                var fileRecordService = scope.ServiceProvider.GetRequiredService<IFileRecordService>();
                                FileRecord fileRecord = await fileRecordService.FindAsync(f => f.FileName == GetFileNameFromUrl(url));
                                if (fileRecord != null)
                                {
                                        fileRecord.IsUsed = isUsed;
                                        await fileRecordService.EditAsync(fileRecord);
                                }
                        }
                }

                // 提取获取文件名的方法
                public static string GetFileNameFromUrl(string url)
                {
                        if (string.IsNullOrEmpty(url)) return null;
                        int baseIndex = url.LastIndexOf("/") + 1;
                        return url.Substring(baseIndex);
                }
        }
}
