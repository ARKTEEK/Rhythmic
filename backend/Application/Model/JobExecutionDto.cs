namespace backend.Application.Model;

public class JobExecutionDto {
  public int Id { get; set; }
  public int ScheduledJobId { get; set; }
  public string Status { get; set; } = string.Empty;
  public DateTime StartedAt { get; set; }
  public DateTime? FinishedAt { get; set; }
  public string? ErrorMessage { get; set; }
  public string? Metadata { get; set; }
}

