using backend.Domain.Enum;

namespace backend.Application.Context;

public static class AuditContext {
  private static readonly AsyncLocal<AuditScope?> _current = new();

  public static bool HasActiveScope => _current.Value != null;

  public static IDisposable BeginScope(AuditType type) {
    if (_current.Value != null) {
      return NoopDisposable.Instance;
    }

    AuditScope scope = new(type);
    _current.Value = scope;
    return scope;
  }

  private sealed class AuditScope : IDisposable {
    public AuditScope(AuditType type) {
      Type = type;
    }

    public AuditType Type { get; }

    public void Dispose() {
      _current.Value = null;
    }
  }

  private sealed class NoopDisposable : IDisposable {
    public static readonly NoopDisposable Instance = new();
    public void Dispose() { }
  }
}