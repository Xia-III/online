using IService;
using Microsoft.Extensions.Hosting;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace Net8WebApi.Utility
{
        public class FileCleanupService : BackgroundService
        {
                private readonly IServiceProvider _serviceProvider;
                private readonly TimeSpan _interval = TimeSpan.FromHours(24); // 设置间隔时间为24小时
                private readonly string _uploadFolder = "/www/wwwroot/APP/HFS/PublicFile/customerService";
                private readonly string local_uploadFolder = @"G:\APP\HFS\hfs-windows-x64-0.57.12\Public\File";

                public FileCleanupService(IServiceProvider serviceProvider) 
                {
                        _serviceProvider = serviceProvider;
                }

                protected override async Task ExecuteAsync(CancellationToken stoppingToken)
                {
                        while (!stoppingToken.IsCancellationRequested)
                        {
                                await Task.Delay(_interval, stoppingToken);

                                // 执行清理任务
                                await CleanupFilesAsync();
                        }
                }

                private async Task CleanupFilesAsync()
                {
                        using var scope = _serviceProvider.CreateScope();
                        var fileRecordService = scope.ServiceProvider.GetRequiredService<IFileRecordService>();
                        try
                        {
                                var fileRecordList = await fileRecordService.QueryAsync(f => f.IsUsed == false);
                                foreach (var fileRecord in fileRecordList)
                                {
                                        string fileName = fileRecord.FileName;
                                        string filePath = Path.Combine(_uploadFolder, fileName);
                                        if (File.Exists(filePath))
                                        {
                                                File.Delete(filePath);
                                                await fileRecordService.DeleteAsync(fileRecord.Id);
                                        }
                                }
                                Console.WriteLine("定时任务，已清除未使用文件");
                        }
                        catch (Exception ex)
                        {
                                Console.WriteLine(ex.ToString());
                        }
                }
        }
}