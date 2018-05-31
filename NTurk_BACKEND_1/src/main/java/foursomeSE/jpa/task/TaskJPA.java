package foursomeSE.jpa.task;

import foursomeSE.entity.contract.ContractStatus;
import foursomeSE.entity.task.Task;
import foursomeSE.entity.task.TaskStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Transactional
public interface TaskJPA extends CrudRepository<Task, Long> {
    List<Task> findByRequesterId(long id);

//    @Query(value = "select * from tasks where task_status = ?1 and end_time < ?2",
//            nativeQuery = true)
//    List<Task> findJustFinishedTasks(TaskStatus taskStatus, LocalDateTime now);
    // 但是这个还需要localDateTimeNow，这个有点怪

    List<Task> findByTaskStatusAndEndTimeBefore(TaskStatus taskStatus, LocalDateTime now);

    // TODO 突然发现上面那个endTimeBefore好像不需要，反正有轮询endTime来改taskStatus
    @Query(value = "select * from tasks where task_status = ?1", nativeQuery = true)
    List<Task> findByTaskStatus(int taskStatus);


    @Query(value =
            "select * from tasks\n" +
            "where task_status = 1 and task_id in (\n" +
            "    select task_id from contracts\n" +
            "    where contract_status = 0 and worker_id in (\n" +
            "        select id from workers\n" +
            "        where email_address = ?1\n" +
            "    )\n" +
            ")",
            nativeQuery = true)
    List<Task> findWorkerInspectionTasks(String username);


    /**
     * 这个方法只是测试用的…感觉这样不好……
     */
    Task findByTaskName(String name);
}


/*
select * from tasks
where task_status = ?2 and task_id in (
    select task_id from contracts
    where contract_status = ?3 and worker_id in (
        select id from workers
        where email_address = ?1
    )
)

select * from tasks
where task_status = 1 and task_id in (
    select task_id from contracts
    where contract_status = 0 and worker_id in (
        select id from workers
        where email_address = 'worker2@ex.com'
    )
)
*/
