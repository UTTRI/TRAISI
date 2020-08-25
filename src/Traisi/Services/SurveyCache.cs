using Microsoft.Extensions.Caching.Memory;

public class SurveyCache {

    private IMemoryCache _memoryCache;
    public SurveyCache(IMemoryCache memoryCache) {
        this._memoryCache = memoryCache;
    }

}