﻿using backend.Domain.Enum;

namespace backend.Application.Model;

public class ProviderTrack {
  public string Id { get; set; }
  public string Title { get; set; }
  public string Artist { get; set; }
  public string Album { get; set; }
  public string? ThumbnailUrl { get; set; }
  public int DurationMs { get; set; }
  public OAuthProvider Provider { get; set; }
}