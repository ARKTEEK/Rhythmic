using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend.Infrastructure.Converters;

public class SoundCloudDateTimeConverter : JsonConverter<DateTime> {
  private const string SoundCloudFormat = "yyyy/MM/dd HH:mm:ss zzz";

  public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert,
    JsonSerializerOptions options) {
    string dateString = reader.GetString();
    if (DateTime.TryParseExact(dateString, SoundCloudFormat, CultureInfo.InvariantCulture,
          DateTimeStyles.None, out DateTime dateTime)) {
      return dateTime;
    }

    return DateTime.Parse(dateString!);
  }

  public override void Write(Utf8JsonWriter writer, DateTime value,
    JsonSerializerOptions options) {
    writer.WriteStringValue(value.ToString(SoundCloudFormat));
  }
}