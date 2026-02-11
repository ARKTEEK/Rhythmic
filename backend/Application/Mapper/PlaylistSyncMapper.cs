using backend.Application.Model.Playlists.Requests;
using backend.Application.Model.Playlists.Sync;
using backend.Domain.Entity;

namespace backend.Application.Mapper;

public static class PlaylistSyncMapper {
  public static PlaylistSyncGroup ToEntity(CreateSyncGroupRequest request, string userId) {
    return new PlaylistSyncGroup {
      UserId = userId,
      Name = request.Name,
      MasterPlaylistId = request.MasterPlaylistId,
      MasterProvider = request.MasterProvider,
      MasterProviderAccountId = request.MasterProviderAccountId,
      SyncEnabled = true,
      CreatedAt = DateTime.UtcNow,
      UpdatedAt = DateTime.UtcNow,
      Children = request.Children.Select(ToEntity).ToList()
    };
  }

  public static PlaylistSyncChild ToEntity(AddChildPlaylistRequest request) {
    return new PlaylistSyncChild {
      ChildPlaylistId = request.ChildPlaylistId,
      Provider = request.Provider,
      ProviderAccountId = request.ProviderAccountId
    };
  }

  public static PlaylistSyncGroupDto ToDto(PlaylistSyncGroup group) {
    return new PlaylistSyncGroupDto {
      Id = group.Id,
      Name = group.Name,
      MasterPlaylistId = group.MasterPlaylistId,
      MasterProvider = group.MasterProvider,
      MasterProviderAccountId = group.MasterProviderAccountId,
      SyncEnabled = group.SyncEnabled,
      LastSyncedAt = group.LastSyncedAt,
      CreatedAt = group.CreatedAt,
      UpdatedAt = group.UpdatedAt,
      Children = group.Children.Select(ToChildDto).ToList()
    };
  }

  public static PlaylistSyncChildDto ToChildDto(PlaylistSyncChild child) {
    return new PlaylistSyncChildDto {
      Id = child.Id,
      ChildPlaylistId = child.ChildPlaylistId,
      Provider = child.Provider,
      ProviderAccountId = child.ProviderAccountId,
      LastSyncedAt = child.LastSyncedAt
    };
  }
}