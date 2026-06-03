using IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.EntityDto;
using Model.EntityMap;
using Net8WebApi.Utility;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Net8WebApi.Controllers
{
        [Route("api")]
        [ApiController]
        public class UploadController : ControllerBase
        {
                private readonly string uploadFolder = @"/www/wwwroot/APP/HFS/PublicFile/customerService"; 
                private readonly string local_uploadFolder = @"G:\APP\HFS\hfs-windows-x64-0.57.12\Public\File";
                private readonly string url = "https://static.huanxizn.com/customerService/";
                private readonly string local_url = "http://localhost:8011/File/"; 
                private readonly IFileRecordService _fileRecordService;
                private readonly string _ffmpegPath = "ffmpeg";
                private const long MAX_IMAGE_SIZE = 10 * 1024; // 图片最大为10KB
                private const double TARGET_VIDEO_COMPRESSION_RATIO = 0.5;
                private const int FFMPEG_TIMEOUT = 300000;

                public UploadController(IFileRecordService fileRecordService)
                {
                        _fileRecordService = fileRecordService;

                        if (!Directory.Exists(uploadFolder))
                        {
                                Directory.CreateDirectory(uploadFolder);
                        }
                }

                [HttpPost("Upload")]
                [Authorize]
                public async Task<Result> UploadFile(IFormFile file)
                {
                        string originalFileName = null;
                        string filePath = null;
                        bool IsCompress=false;
                        try
                        {
                                if (file == null || file.Length == 0)
                                {
                                        return Result.Error("未接收到文件");
                                }

                                string fileExtension = Path.GetExtension(file.FileName).ToLower();
                                originalFileName = Guid.NewGuid().ToString() + fileExtension;
                                filePath = Path.Combine(uploadFolder, originalFileName);

                                using (var stream = new FileStream(filePath, FileMode.Create))
                                {
                                        await file.CopyToAsync(stream);
                                }

                                string finalFileName = originalFileName;

                                if (IsImageFile(fileExtension))
                                {
                                        long originalSize = new FileInfo(filePath).Length;
                                        Console.WriteLine($"原始文件大小: {originalSize} bytes");

                                        // 修改为压缩到10KB以下
                                        string compressedFilePath = await CompressImageToUnder10KB(filePath);
                                        if (!string.IsNullOrEmpty(compressedFilePath) && compressedFilePath != filePath)
                                        {
                                                // 删除原始文件
                                                System.IO.File.Delete(filePath);
                                                finalFileName = Path.GetFileName(compressedFilePath);

                                                long compressedSize = new FileInfo(compressedFilePath).Length;
                                                double compressionRatio = (double)compressedSize / originalSize;
                                                Console.WriteLine($"压缩成功: {originalSize} bytes -> {compressedSize} bytes, 压缩比: {compressionRatio:P}");
                                                IsCompress = true;
                                        }
                                        else if (compressedFilePath == filePath)
                                        {
                                                // 原始文件已经小于10KB，无需压缩
                                                long fileSize = new FileInfo(filePath).Length;
                                                if (fileSize <= MAX_IMAGE_SIZE)
                                                {
                                                        Console.WriteLine($"原始文件已小于10KB ({fileSize} bytes)，无需压缩");
                                                        IsCompress = true;
                                                }
                                                else
                                                {
                                                        // 压缩失败，删除原始文件并返回错误
                                                        System.IO.File.Delete(filePath);
                                                        return Result.Error("图片压缩失败，请减小图片大小后再次尝试上传");
                                                }
                                        }
                                        else
                                        {
                                                // 压缩失败，删除原始文件并返回错误
                                                System.IO.File.Delete(filePath);
                                                return Result.Error("图片压缩失败，请减小图片大小后再次尝试上传");
                                        }
                                }
                                else if (IsVideoFile(fileExtension))
                                {
                                        // 临时取消视频压缩，直接使用原始文件
                                        long originalSize = new FileInfo(filePath).Length;
                                        Console.WriteLine($"视频文件已保存，大小: {originalSize} bytes，未进行压缩");

                                        // 直接使用原始文件，finalFileName已经是originalFileName
                                        // 无需任何压缩操作
                                }

                                FileRecord fileRecord = new FileRecord();
                                fileRecord.FileName = finalFileName;
                                fileRecord.IsCompress = IsCompress;
                                await _fileRecordService.CreateAsync(fileRecord);

                                string fileUrl = url + finalFileName;
                                return Result.Success(fileUrl);
                        }
                        catch (Exception ex)
                        {
                                if (!string.IsNullOrEmpty(filePath) && System.IO.File.Exists(filePath))
                                {
                                        System.IO.File.Delete(filePath);
                                }

                                return Result.Error($"文件上传失败: {ex.Message}");
                        }
                }

                private bool IsImageFile(string fileExtension)
                {
                        string[] imageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp" };
                        return Array.Exists(imageExtensions, ext => ext == fileExtension);
                }

                private bool IsVideoFile(string fileExtension)
                {
                        string[] videoExtensions = { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv", ".m4v", ".3gp" };
                        return Array.Exists(videoExtensions, ext => ext == fileExtension);
                }

                private async Task<string> CompressImageToUnder10KB(string imagePath)
                {
                        try
                        {
                                string fileExtension = Path.GetExtension(imagePath).ToLower();
                                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(imagePath);

                                long originalSize = new FileInfo(imagePath).Length;
                                Console.WriteLine($"开始压缩: {imagePath}, 大小: {originalSize} bytes");

                                if (originalSize <= MAX_IMAGE_SIZE)
                                {
                                        Console.WriteLine($"原始文件已小于10KB ({originalSize} bytes)，无需压缩");
                                        return imagePath;
                                }

                                // 直接使用激进压缩参数，不保留中间文件
                                string compressedFilePath = await ApplyAggressiveCompression(imagePath, fileNameWithoutExt);

                                if (!string.IsNullOrEmpty(compressedFilePath) && System.IO.File.Exists(compressedFilePath))
                                {
                                        long compressedSize = new FileInfo(compressedFilePath).Length;
                                        Console.WriteLine($"压缩后大小: {compressedSize} bytes");

                                        if (compressedSize <= MAX_IMAGE_SIZE)
                                        {
                                                return compressedFilePath;
                                        }
                                        else
                                        {
                                                // 压缩后仍然大于10KB，删除压缩文件并返回失败
                                                System.IO.File.Delete(compressedFilePath);
                                                Console.WriteLine($"压缩后文件仍然大于10KB ({compressedSize} bytes)，压缩失败");
                                                return null;
                                        }
                                }

                                Console.WriteLine("图片压缩失败");
                                return null;
                        }
                        catch (Exception ex)
                        {
                                Console.WriteLine($"图片压缩失败: {ex.Message}");
                                return null;
                        }
                }

                private async Task<string> ApplyAggressiveCompression(string imagePath, string fileNameWithoutExt)
                {
                        // 使用激进压缩参数，直接生成最终文件
                        string finalFilePath = Path.Combine(uploadFolder, $"{fileNameWithoutExt}.webp");

                        // 尝试多种压缩策略，从最高质量到最低质量
                        int[] qualityLevels = { 30, 15, 10 };
                        double[] scaleFactors = { 0.3, 0.2, 0.1 };

                        foreach (int quality in qualityLevels)
                        {
                                foreach (double scale in scaleFactors)
                                {
                                        string ffmpegArgs = $"-i \"{imagePath}\" -vf \"scale=iw*{scale}:ih*{scale}\" -quality {quality} \"{finalFilePath}\" -y";
                                        Console.WriteLine($"尝试压缩: 质量={quality}, 缩放={scale}, 参数: {ffmpegArgs}");

                                        bool success = await RunFFmpegCompression(ffmpegArgs);
                                        if (success && System.IO.File.Exists(finalFilePath))
                                        {
                                                long compressedSize = new FileInfo(finalFilePath).Length;
                                                Console.WriteLine($"压缩结果: {compressedSize} bytes");

                                                if (compressedSize <= MAX_IMAGE_SIZE)
                                                {
                                                        return finalFilePath;
                                                }
                                                else
                                                {
                                                        // 删除不符合要求的文件，继续尝试下一组参数
                                                        System.IO.File.Delete(finalFilePath);
                                                }
                                        }
                                }
                        }

                        return null;
                }

                // 保留视频压缩相关方法但暂时不使用，以便将来恢复
                private async Task<string> CompressVideoWithRatio(string videoPath, double targetRatio)
                {
                        // 临时不执行视频压缩，直接返回原文件路径
                        Console.WriteLine("视频压缩功能已临时禁用");
                        return videoPath;
                }

                private async Task<string> TryVideoCompression(string videoPath, string fileExtension, string fileNameWithoutExt, long targetSize, double duration, VideoInfo videoInfo)
                {
                        // 临时不执行视频压缩，直接返回原文件路径
                        Console.WriteLine("视频压缩功能已临时禁用");
                        return videoPath;
                }

                private async Task<string> AdjustVideoCompression(string videoPath, string fileExtension, string fileNameWithoutExt, long targetSize, double duration)
                {
                        // 临时不执行视频压缩，直接返回原文件路径
                        Console.WriteLine("视频压缩功能已临时禁用");
                        return videoPath;
                }

                // 视频信息类
                private class VideoInfo
                {
                        public int Bitrate { get; set; } // kbps
                        public int Width { get; set; }
                        public int Height { get; set; }
                        public string Codec { get; set; }
                        public double Duration { get; set; } // 秒
                }

                private async Task<VideoInfo> GetVideoInfo(string videoPath)
                {
                        try
                        {
                                using (Process process = new Process())
                                {
                                        process.StartInfo.FileName = _ffmpegPath;
                                        process.StartInfo.Arguments = $"-i \"{videoPath}\"";
                                        process.StartInfo.UseShellExecute = false;
                                        process.StartInfo.CreateNoWindow = true;
                                        process.StartInfo.RedirectStandardError = true;

                                        process.Start();
                                        string error = await process.StandardError.ReadToEndAsync();
                                        await process.WaitForExitAsync();

                                        var info = new VideoInfo();

                                        // 解析时长
                                        Match durationMatch = Regex.Match(error, @"Duration: (\d{2}):(\d{2}):(\d{2})\.\d+");
                                        if (durationMatch.Success)
                                        {
                                                int hours = int.Parse(durationMatch.Groups[1].Value);
                                                int minutes = int.Parse(durationMatch.Groups[2].Value);
                                                int seconds = int.Parse(durationMatch.Groups[3].Value);
                                                info.Duration = hours * 3600 + minutes * 60 + seconds;
                                        }
                                        else
                                        {
                                                info.Duration = 60.0; // 默认60秒
                                        }

                                        // 解析比特率
                                        Match bitrateMatch = Regex.Match(error, @"bitrate: (\d+) kb/s");
                                        if (bitrateMatch.Success)
                                        {
                                                info.Bitrate = int.Parse(bitrateMatch.Groups[1].Value);
                                        }
                                        else
                                        {
                                                info.Bitrate = 1103; // 默认比特率
                                        }

                                        // 解析分辨率
                                        Match resolutionMatch = Regex.Match(error, @"(\d+)x(\d+)");
                                        if (resolutionMatch.Success)
                                        {
                                                info.Width = int.Parse(resolutionMatch.Groups[1].Value);
                                                info.Height = int.Parse(resolutionMatch.Groups[2].Value);
                                        }

                                        // 解析编码信息
                                        if (error.Contains("Video: h264"))
                                        {
                                                info.Codec = "h264";
                                        }

                                        return info;
                                }
                        }
                        catch (Exception ex)
                        {
                                Console.WriteLine($"获取视频信息失败: {ex.Message}");
                                return new VideoInfo { Duration = 60.0, Bitrate = 1103 };
                        }
                }

                private async Task<bool> RunFFmpegCompression(string ffmpegArgs)
                {
                        try
                        {
                                using (Process process = new Process())
                                {
                                        process.StartInfo.FileName = _ffmpegPath;
                                        process.StartInfo.Arguments = ffmpegArgs;
                                        process.StartInfo.UseShellExecute = false;
                                        process.StartInfo.CreateNoWindow = true;
                                        process.StartInfo.RedirectStandardOutput = true;
                                        process.StartInfo.RedirectStandardError = true;

                                        process.Start();

                                        // 异步读取输出，避免阻塞
                                        var outputTask = process.StandardOutput.ReadToEndAsync();
                                        var errorTask = process.StandardError.ReadToEndAsync();

                                        // 等待进程退出，设置超时
                                        if (await Task.Run(() => process.WaitForExit(FFMPEG_TIMEOUT)))
                                        {
                                                string output = await outputTask;
                                                string error = await errorTask;

                                                if (process.ExitCode != 0)
                                                {
                                                        Console.WriteLine($"FFmpeg压缩失败: {error}");
                                                        return false;
                                                }

                                                Console.WriteLine($"FFmpeg处理完成");
                                                return true;
                                        }
                                        else
                                        {
                                                // 超时，杀死进程
                                                process.Kill();
                                                Console.WriteLine($"FFmpeg压缩超时，已杀死进程");
                                                return false;
                                        }
                                }
                        }
                        catch (Exception ex)
                        {
                                Console.WriteLine($"FFmpeg执行失败: {ex.Message}");
                                return false;
                        }
                }
                [HttpPost("UploadImage")]
                [Authorize]
                public async Task<Result> UploadImage(IFormFile file)
                {
                        string tempFilePath = null;
                        string finalFilePath = null;
                        string finalFileName = null;

                        try
                        {
                                // 1. 验证文件
                                if (file == null || file.Length == 0)
                                {
                                        return Result.Error("未接收到文件");
                                }

                                string fileExtension = Path.GetExtension(file.FileName).ToLower();
                                if (!IsImageFile(fileExtension))
                                {
                                        return Result.Error("仅支持上传图片文件");
                                }

                                // 2. 生成最终文件名（WebP 格式）
                                finalFileName = Guid.NewGuid().ToString() + ".webp";
                                finalFilePath = Path.Combine(uploadFolder, finalFileName);

                                // 3. 将上传文件保存到临时位置（便于转换）
                                tempFilePath = Path.GetTempFileName();
                                using (var stream = new FileStream(tempFilePath, FileMode.Create))
                                {
                                        await file.CopyToAsync(stream);
                                }

                                // 4. 使用 FFmpeg 转换为 WebP，质量 0.8
                                //    ffmpeg -i input -quality 80 -c:v libwebp output.webp -y
                                string ffmpegArgs = $"-i \"{tempFilePath}\" -quality 80 -c:v libwebp \"{finalFilePath}\" -y";
                                bool success = await RunFFmpegCompression(ffmpegArgs);

                                if (!success || !System.IO.File.Exists(finalFilePath))
                                {
                                        return Result.Error("图片转换失败");
                                }

                                // 5. 记录文件信息
                                FileRecord fileRecord = new FileRecord
                                {
                                        FileName = finalFileName,
                                        IsCompress = true   // 标记为已压缩
                                };
                                await _fileRecordService.CreateAsync(fileRecord);

                                // 6. 返回 URL
                                string fileUrl = url + finalFileName;
                                return Result.Success(fileUrl);
                        }
                        catch (Exception ex)
                        {
                                // 清理可能遗留的文件
                                if (!string.IsNullOrEmpty(finalFilePath) && System.IO.File.Exists(finalFilePath))
                                {
                                        System.IO.File.Delete(finalFilePath);
                                }
                                return Result.Error($"图片上传失败: {ex.Message}");
                        }
                        finally
                        {
                                // 清理临时文件
                                if (!string.IsNullOrEmpty(tempFilePath) && System.IO.File.Exists(tempFilePath))
                                {
                                        System.IO.File.Delete(tempFilePath);
                                }
                        }
                }

                [HttpPost("BindFile")]
                [Authorize]
                public async Task<Result> BindFile(string fileName, string segmentId)
                {
                        FileRecord T = await _fileRecordService.FindAsync(f => f.FileName == fileName);
                        if (T != null)
                        {
                                T.SegmentId = segmentId;
                                T.IsUsed = true;
                        }
                        return await _fileRecordService.EditAsync(T) ? Result.Success() : Result.Error("修改失败");
                }

                [HttpPost("UpdateBindFile")]
                [Authorize]
                public async Task<Result> UpdateBindFile(string fileName, string segmentId)
                {
                        FileRecord T = await _fileRecordService.FindAsync(f => f.SegmentId == segmentId);
                        if (T != null)
                        {
                                T.SegmentId = null;
                                T.IsUsed = false;
                                await _fileRecordService.EditAsync(T);
                        }
                        T = await _fileRecordService.FindAsync(f => f.FileName == fileName);
                        if (T != null)
                        {
                                T.SegmentId = segmentId;
                                T.IsUsed = true;
                        }
                        else 
                        {
                                return Result.Error("查找不到文件");
                        }
                        return await _fileRecordService.EditAsync(T) ? Result.Success() : Result.Error("修改失败");
                }

                [HttpDelete("DeleteBindFile")]
                [Authorize]
                public async Task<Result> DeleteBindFile(string segmentId)
                {
                        FileRecord T = await _fileRecordService.FindAsync(f => f.SegmentId == segmentId);
                        if (T != null)
                        {
                                T.IsUsed = false;
                                T.SegmentId = null;
                        }
                        else
                        {
                                return Result.Error("查找不到记录");
                        }
                        return await _fileRecordService.EditAsync(T) ? Result.Success() : Result.Error("修改失败");
                }

                [HttpDelete("ClearUnuseFile")]
                public async Task<Result> ClearUnuseFile()
                {
                        try
                        {
                                List<FileRecord> fileRecordList = await _fileRecordService.QueryAsync(f => f.IsUsed == false);
                                foreach (FileRecord fileRecord in fileRecordList)
                                {
                                        string fileName = fileRecord.FileName;
                                        //根据文件名删除文件uploadFolder路径下的文件
                                        string filePath = Path.Combine(uploadFolder, fileName);
                                        if (System.IO.File.Exists(filePath))
                                        {
                                                System.IO.File.Delete(filePath);
                                                // 删除数据库记录
                                                await _fileRecordService.DeleteAsync(fileRecord.Id);
                                        }
                                }
                                return Result.Success("未使用的文件已清除");
                        }
                        catch (Exception ex)
                        {
                                return Result.Error($"文件缓存清除失败: {ex.Message}");
                        }
                }
        }
}