using AutoMapper;
using Model.EntityDto;
using Model.EntityMap;

namespace Net8WebApi.Utility
{
        public class CustomAutoMapperProfile : Profile
        {
                public CustomAutoMapperProfile()
                {
                        CreateMap<User, UserDto>().ReverseMap();
                        CreateMap<User, UserDtotwo>().ReverseMap();
                }
        }
}
