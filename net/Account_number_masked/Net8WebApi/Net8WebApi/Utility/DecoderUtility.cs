namespace Net8WebApi.Utility
{
        public static class DecoderUtility
        {
                /// <summary>
                /// 解码算法
                /// </summary>
                /// <param name="param1">第一个参数（字符串格式的数字）</param>
                /// <param name="param2">第二个参数（字符串格式的数字）</param>
                /// <param name="param3">第三个参数（字符串格式的数字，范围0-99）</param>
                /// <returns>解码结果</returns>
                public static string Decode(string param1, string param2, string param3)
                {
                        // 验证输入
                        if (string.IsNullOrEmpty(param1) || string.IsNullOrEmpty(param2) || string.IsNullOrEmpty(param3))
                        {
                                throw new ArgumentException("请输入所有参数");
                        }

                        // 将输入转换为数字
                        if (!int.TryParse(param1, out int num1) ||
                            !int.TryParse(param2, out int num2) ||
                            !int.TryParse(param3, out int num3))
                        {
                                throw new ArgumentException("请输入有效的数字");
                        }

                        // 验证第三个参数是否为0-99之间的数字
                        if (num3 < 0 || num3 > 99)
                        {
                                throw new ArgumentException("第三个参数必须是0-99之间的数字");
                        }

                        try
                        {
                                // 将第一和第二个参数进行异或运算
                                int xor1 = num1 ^ num2;

                                // 结果a再和十进制数123456继续异或运算
                                const int decimalConstant = 123456;
                                int xor2 = xor1 ^ decimalConstant;

                                // 将结果转换成10进制数得到b
                                int b = xor2;

                                // b取末尾的6位数，不足前面补0，得到c
                                string bStr = b.ToString();
                                string c = bStr.Length >= 6 ?
                                    bStr.Substring(bStr.Length - 6) :
                                    bStr.PadLeft(6, '0');

                                // 获取第三个参数的十位和个位
                                // 如果第三个参数是0-9，十位数为0
                                int tensDigit = num3 / 10;      // 十位数
                                int onesDigit = num3 % 10;      // 个位数

                                // 将c的第六位替换成第三个参数的十位数，第三位替换成第三个参数的个位数
                                char[] resultArray = c.ToCharArray();

                                // 索引对应关系：
                                // 索引0: 第1位
                                // 索引1: 第2位  
                                // 索引2: 第3位
                                // 索引3: 第4位  ← 替换为个位数
                                // 索引4: 第5位
                                // 索引5: 第6位  ← 替换为十位数

                                resultArray[5] = tensDigit.ToString()[0];  // 第六位替换为十位数
                                resultArray[2] = onesDigit.ToString()[0];  // 第三位替换为个位数

                                string finalResult = new string(resultArray);

                                return finalResult;
                        }
                        catch (Exception ex)
                        {
                                throw new InvalidOperationException("解码失败，请重试", ex);
                        }
                }

                /// <summary>
                /// 尝试解码方法
                /// </summary>
                /// <param name="param1">第一个参数</param>
                /// <param name="param2">第二个参数</param>
                /// <param name="param3">第三个参数</param>
                /// <param name="result">解码结果</param>
                /// <param name="errorMessage">错误信息</param>
                /// <returns>是否解码成功</returns>
                public static bool TryDecode(string param1, string param2, string param3,
                    out string result, out string errorMessage)
                {
                        result = null;
                        errorMessage = null;

                        try
                        {
                                result = Decode(param1, param2, param3);
                                return true;
                        }
                        catch (ArgumentException ex)
                        {
                                errorMessage = ex.Message;
                                return false;
                        }
                        catch (Exception ex)
                        {
                                errorMessage = "解码失败，请重试";
                                Console.Error.WriteLine($"解码失败: {ex.Message}");
                                return false;
                        }
                }
        }
}