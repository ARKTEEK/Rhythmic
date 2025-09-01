using backend.Domain.Entity;

namespace backend.Application.Interface;

public interface IAccountTokensService {
  Task SaveOrUpdateAsync(AccountToken accountToken);
}