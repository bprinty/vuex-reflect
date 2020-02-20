# Querying


## Mutations

The list of available query operators is as follows:

| Method     | Description                                                            |
|:-----------|:-----------------------------------------------------------------------|
|**filter**  | Filter query data by specific parameters or callable                   |
|**has**     | Filter query data to include only models with non-null parameter       |
|**all**     | Return all results of query                                            |
|**first**   | Return first result of query                                           |
|**last**    | Return last result of query                                            |
|**random**  | Return random result of query                                          |
|**sample**  | Sample `n` records from the query                                      |
|**count**   | Collapse query into count of records                                   |
|**sum**     | Collapse query into sum of values of specified property across records |
|**min**     | Collapse query into minimum value of specified property across records |
|**max**     | Collapse query into maximum value of specified property across records |
|**offset**  | Remove the first `n` records from the query                            |
|**limit**   | Limit query to the first `n` records                                   |
|**order**   | Order query results by a Model property                                |


Here are some code examples detailing how each of these methods can be used:
