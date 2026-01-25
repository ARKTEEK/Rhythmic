
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

public class SoundCloudDateTimeConverter : JsonConverter<DateTime> {
  private const string SoundCloudFormat = "yyyy/MM/dd HH:mm:ss zzz";

  public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
    String dateString = reader.GetString();
    if (DateTime.TryParseExact(dateString, SoundCloudFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateTime)) {
      return dateTime;
    }

    return DateTime.Parse(dateString!);
  }

  public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options) {
    writer.WriteStringValue(value.ToString(SoundCloudFormat));
  }
}
