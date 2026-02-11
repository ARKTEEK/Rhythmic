namespace backend.Application.Model.Jobs;

public class ScheduledJobDto {
  public int Id { get; set; }
  public string JobType { get; set; } = string.Empty;
  public string TargetType { get; set; } = string.Empty;
  public int TargetId { get; set; }
  public string? CronExpression { get; set; }
  public int? IntervalMinutes { get; set; }
  public bool Enabled { get; set; }
  public DateTime? LastRunAt { get; set; }
  public DateTime? NextRunAt { get; set; }
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }
}