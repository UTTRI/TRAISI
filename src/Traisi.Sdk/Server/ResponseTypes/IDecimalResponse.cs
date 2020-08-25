namespace Traisi.Sdk.Library.ResponseTypes
{
    public interface IDecimalResponse : IResponseType
    {
        double Value { get; set; }
    }
}