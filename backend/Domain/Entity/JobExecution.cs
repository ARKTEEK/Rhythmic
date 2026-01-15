using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace backend.Domain.Entity;

public class JobExecution {
  [Key] public int Id { get; set; }

  [Required] public int ScheduledJobId { get; set; }
  public ScheduledJob ScheduledJob { get; set; }

  [Required] public string Status { get; set; }

  public DateTime StartedAt { get; set; } = DateTime.UtcNow;

  public DateTime? FinishedAt { get; set; }

  public string? ErrorMessage { get; set; }

  public string? Metadata { get; set; }
}

