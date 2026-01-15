using System.ComponentModel.DataAnnotations;

namespace backend.Domain.Entity;

public class ScheduledJob {
  [Key] public int Id { get; set; }

  [Required] public string UserId { get; set; }
  public User User { get; set; }

  [Required] public string JobType { get; set; }

  [Required] public string TargetType { get; set; }

  [Required] public int TargetId { get; set; }

  public string? CronExpression { get; set; }

  public int? IntervalMinutes { get; set; }

  public bool Enabled { get; set; } = true;

  public DateTime? LastRunAt { get; set; }

  public DateTime? NextRunAt { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public ICollection<JobExecution> Executions { get; set; } = new List<JobExecution>();
}

