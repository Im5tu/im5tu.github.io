{
   "categories": [ "Development" ],
   "date": "2014-09-28T18:35:57Z",
   "description": "This article describes the fundamentals of MSMQ. MSMQ is Microsoft's Message Queuing service that can be used to implement both synchronous and asynchronous solutions.",
   "tags": [ "dotnet", "messaging", "msmq", "csharp" ],
   "title": "Message Queue Fundementals: MSMQ"
}

MSMQ is Microsoft's Message Queuing service that can be used to implement both synchronous and asynchronous solutions. Typically solutions are architectured using the available C++ API’s or via the relevant COM objects. The .Net Framework exposes the System.Messaging namespace which contains all the classes that you need to work with the MSMQ API. <!--more-->

If you would like to read the first part to the article, [click here to read about Message Queue Fundamentals](http://sblackler.net/2014/09/07/Message-Queue-Fundementals-Introduction/).

In this article I will cover the following topics:

- Types of Queues in MSMQ
	- Application Queues
    	- Public/Private Queues
	    - Transactional and non-transactional Queues
    	- Sub-Queues
	    - Administration Queues
	    - Response Queues
    	- Report Queues
	- System Queues
	    - Journal Queues
    	- Internal Private Queues
	    - Dead-letter Queues
    	- Connector Queues
    	- Outgoing Queues
- Creating an MSMQ Message Queue
- Accessing an MSMQ Message Queue
- Sending a message to a MSMQ Message Queue
	- Sending a message to a MSMQ Message Queue using transactions
- Retrieving a message from a MSMQ Message Queue
	- Retrieving a message from a MSMQ Message Queue using transactions

*Before you begin, you need to have MSMQ installed on your machine, please do this by following [these instructions](http://msdn.microsoft.com/en-us/library/aa967729(v=vs.110).aspx).*

## Types of Queues in MSMQ

This section describes the available queue types within MSMQ. Although I will not cover the consumption of all the available types of queue, I will briefly describe the following type of queue: 

- Application Queues
    - Public/Private Queues
    - Transactional and non-transactional Queues
    - Sub-Queues
    - Administration Queues
    - Response Queues
    - Report Queues
- System Queues
    - Journal Queues
    - Internal Private Queues
    - Dead-letter Queues
    - Connector Queues
    - Outgoing Queues

The quintessential difference between application and system queues is the ability to address messages to the queue. With application queues you can have, essentially, read/write capabilities, whereas you can only read messages from a system queue.


### Administration Queues
#### Private vs Public Queues

Deciding between a public and private queue depends on the requirements of the application and the infrastructure available. Public queues use Active Directory Domain Services to replicate the queue through the domain forest, providing reliability. They are both persistent and available to other applications. In contrast, private queues are only displayed on the local computer that contains them. Because private queues involve no replication, they are quicker to create, have lower latency and has no replication overhead as they are not distributed through a domain forest.

*For further on the permissions required for a public queue, please see [this Technet article](http://technet.microsoft.com/en-us/library/cc772532.aspx).*

#### Transactional vs Non-Transactional Queues

As the name suggests, a transactional queue that only contains transactional messages. That is, when a message is written to/read from the queue the server/client must confirm the receipt of the message before the message can be removed from/added to the message queue. In contrast, a non-transactional queue each message is sent as a single operation (regardless of how many destinations the message is sent to), so there are no guarantees that messages will reach their destination. This is similar to TCP vs UDP. TCP (Transactional) guarantees message delivery where as UDP (Non-transactional) does not.

*For more information on transactional and non-transactional messaging, please see [this MSDN article](http://msdn.microsoft.com/en-us/library/ms704006(v=vs.85).aspx).*

#### Sub-Queues

Sub-Queues are useful for a variety of scenarios including work order processing and poison message handling. Work order processing is the process in which line items are ordered in a more efficient manner for processing. Poison message handling involves dealing with messages that have exceeded the send timeout; hit the retry limit; or any application specific error such as a transaction timeout. For a more detailed explanation of poison messages, I would suggest reading the [Poison Message Handling article on MSDN](http://msdn.microsoft.com/en-us/library/ms789028(v=vs.110).aspx).

Unlike normal queues, the act of passing a message to a sub-queue invokes the creation of the queue if it does not already exist. If the sub-queue exists, the message is passed into the queue as normal. Furthermore, when the queue is empty and there are no open handles to the sub-queue, MSMQ removes the queue on your behalf. Apart from these main differences, sub-queues share the same properties as their parent queue, eg:

- Quota
- Access Control List (ACL)
- Transactional Type

#### Administration Queues

Typically, you would not be accessing administration queues as they are application-generated for the purpose of positive/negative message acknowledgement. Although any non-transactional queue can be defined as an administration queue, I will not be covering this type of queue any further.

#### Response Queues

Like administration queues, response queues are application generated that store application generated response messages returned by an application that is reading messages. Unlike administration queues however, any available queue can be specified as a response queue. Since MSMQ has no control over the contents of a message in a response queue, it is up to the receiving application to understand and process the message correctly.

#### Report Queues

Each computer that has MSMQ installed can have a single report queue created on it. This is an application-generated queue that is used to store report messages that detail the route that the message took in order to reach its destination. The queue must have the following label and queue type identifier:

- Label: MQReport Queue
- Queue type identified: `{55EE8F32-CCE9-11CF-B108-0020AFD61CE9}`

A report queue can either be created through Active Directory Users and Computers, or programmatically if the correct label and queue type identifier has been specified.

### System Queues
#### Journal Queues

A journal queue is presented in two forms: A Queue Journal & A Computer Journal. A queue journal details all of the messages that have been removed from a queue. A computer journal contains copies of all the messages that are sent from a computer. Typically, you would use these queues for message diagnosis and audit purposes only.

#### Internal Private Queues

Internal queues are at the core of MSMQ. They are used as interim queues for storing and forwarding messages to a destination queue. They are not published in AD DS and are local to the current computer.

#### Dead-Letter Queues
Dead-letter queues contain messages that cannot be delivered. MSMQ provides a transactional dead-letter queue and a non-transactional dead-letter queue. The process of storing undelivered messages on a source computer is sometimes referred to as negative source journalling. Applications can only read or delete messages from a dead letter queue. Sending to the queue is handled by the MSMQ internals. 

#### Connector Queues
Simply put, Connector queues are used for cross-platform messaging. For a detailed guide on how this works, refer to the documentation [on MSDN](http://msdn.microsoft.com/en-us/library/ms706915(v=vs.85).aspx).

#### Outgoing Queues
Outgoing queues are local internal queues that are used to store messages sent to remote queues. Messages can be stored in outgoing queues under off-line conditions and then sent to target queues on remote computers when connectivity is restored. These queues are generated automatically and cannot be created or deleted manually.

## Creating an MSMQ Message Queue

After you have installed MSMQ, you  can access the control panel for MSMQ by opening `Computer Management > Services and Applications > Message Queuing`. From here you can see the four types of queue available within MSMQ as well as the MSMQ triggers (if you installed the triggers):

## Accessing an MSMQ Message Queue

In order to access a message queue, you need to add a reference `System.Messaging`. This will provide you access to the `MessageQueue` class. If you know the path, format name or label you can use [the following constructor overload](http://msdn.microsoft.com/en-us/library/ch1d814t(v=vs.110).aspx):

    var mq = new MessageQueue(pathOrFormatOrLabel);
    
The path name can be in the following [syntax](http://msdn.microsoft.com/en-us/library/ms706083(v=vs.85).aspx):

    var mq = new MessageQueue(@"ComputerName\QueueName");
    var mq = new MessageQueue(@"ComputerName\PRIVATE$\QueueName");
    var mq = new MessageQueue(@".\QueueName");
    
The period shown in the last example is a common computer representation of the local computer.

In order to reference a queue by its label, the string must start with `Label:` followed by the name of the queue. For example:

    var mq = new MessageQueue("Label:TestQueue");
    
Lastly, accessing a queue via its GUID requires the following format `FormatName:Modifier=GUID", for example:

    var mq = new MessageQueue("FormatName:Public=5A5F7535-AE9A-41d4-935C-845C2AFF7112");
    
Dead letter queues, computer journals and queue journals can all be monitored by using the following paths:

    var mq = new MessageQueue(@".\DeadLetter$"); // Non-transactional Dead Letter Queue
    var mq = new MessageQueue(@".\XactDeadLetter$"); // Transactional Dead Letter Queue 
    var mq = new MessageQueue(@".\Journal$"); // Computer Journal
    var mq = new MessageQueue(@".\TestQueue\Journal$"); // Queue Journal                

## Sending a message to an MSMQ Message Queue

In order to send a message to a message queue, you need to know how to access the queue as described above. Next you need to create an instance of the `MessageQueue` class using one of the following [MessageQueue constructors](http://msdn.microsoft.com/en-us/library/System.Messaging.MessageQueue.MessageQueue(v=vs.110).aspx). The `MessageQueue` class inherits from Component, which implements `IDisposable`, allowing us to cleanly free the resources of the queue by using a `using` statement:

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    }

Once the queue has been created, we should check that we can write to the queue by using the `CanWrite` property:

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanWrite)
    	{
    	}
    	else
    	{
    		// we cannot write to the queue
    	}
    }
    
Then we can create an instance of the `Message` class and call the `Send` method on the message queue to send our message: 

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanWrite)
    	{
    		var msg = new Message("Hello world");
            mq.Send(msg);    		
    	}
    	else
    	{
    		// we cannot write to the queue
    	}
    }

### Sending a message to an MSMQ Message Queue using transactions

Sometimes we will be required to send messages to a transactional queue. We can extend our previous example to include a check on the `Transactional` property:
    
    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanWrite)
    	{
    		var msg = new Message("Hello world");
    		if(mq.Transactional)
    		{
    		}
    		else
    		{	
	            mq.Send(msg);
    		}    		    		
    	}
    	else
    	{
    		// we cannot write to the queue
    	}
    }

Here I have branched out the original code into the else branch to compare. Next, we should construct a `MessageQueueTransaction` object which in turn can be passed to the `Send` method. Before we call the `Send` method, we need to ensure that we have called the `Begin` method on the transaction object, and `Commit` when we have completed. This will ensure that MSMQ will use the correct transactional semantics:
    
    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanWrite)
    	{
    		var msg = new Message("Hello world");
    		if(mq.Transactional)
    		{
    			var transaction = new MessageQueueTransaction();
                transaction.Begin();
                mq.Send(msg, transaction);
                transaction.Commit();
    		}
    		else
    		{	
	            mq.Send(msg);
    		}    		    		
    	}
    	else
    	{
    		// we cannot write to the queue
    	}
    }
    

## Retrieving a message from an MSMQ Message Queue

In order to retrieve a message from a message queue, you need to know how to access the queue as described above. Next you need to create an instance of the `MessageQueue` class using one of the following [MessageQueue constructors](http://msdn.microsoft.com/en-us/library/System.Messaging.MessageQueue.MessageQueue(v=vs.110).aspx).

    using(var mq = new MessageQueue(".\TestQueue"))
    {    
    }
    
Once the queue has been created, we should check that we can read from the queue by using the `CanRead` property:

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanRead)
    	{
    	}
    	else
    	{
    		// we can not receive from the queue
    	}
    }
    
From here, it is a case of calling the `Receive` method and processing the result:

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanRead)
    	{
    		var msg = mq.Receive();
    		// do something with the received message
    	}
    	else
    	{
    		// we can not receive from the queue
    	}
    }

*You may have to set the `Formatter` property as shown [here](http://msdn.microsoft.com/en-us/library/y918yfy2(v=vs.110).aspx).*

### Retrieving a message from an MSMQ Message Queue using transactions

Similarly to the transactional code we used when sending a message, we can inspect the `Transactional` property on the `MessageQueue` before creating a `MessageQueueTransaction` object, passing it to the `Receive` method:

    using(var mq = new MessageQueue(".\TestQueue"))
    {
    	if(mq.CanRead)
    	{
    		if(mq.Transactional)
    		{
			    var transaction = new MessageQueueTransaction();
                transaction.Begin();
                mq.Receive(transaction);
                transaction.Commit();	    		
    		}
    		else
    		{
    			var msg = mq.Receive();
    			// do something with the received message
    		}
    	}
    	else
    	{
    		// we can not receive from the queue
    	}
    }